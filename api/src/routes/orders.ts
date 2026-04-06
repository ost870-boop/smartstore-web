import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, optionalAuthenticate, AuthRequest } from '../middlewares/auth.middleware';
import axios from 'axios';

const router = Router();

// POST /api/orders - 주문 생성
router.post('/', optionalAuthenticate, async (req: AuthRequest, res: Response) => {
    const { items, couponCode, shippingAddress, guestName, guestPhone, guestEmail } = req.body;

    try {
        let userId = req.user?.id;
        if (!userId) {
            // 게스트: 공유 게스트 계정 사용
            let guestUser = await prisma.user.findUnique({ where: { email: 'guest@smartstore.com' } });
            if (!guestUser) {
                guestUser = await prisma.user.create({
                    data: { email: 'guest@smartstore.com', password: 'guest', role: 'GUEST', name: '비회원' }
                });
            }
            userId = Number(guestUser.id);
        }

        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) { res.status(404).json({ error: `상품을 찾을 수 없습니다.` }); return; }

            let itemPrice = product.price;
            let optionIdString: string | undefined = undefined;

            if (item.optionId) {
                const option = await prisma.productOption.findUnique({ where: { id: item.optionId } });
                if (option) {
                    itemPrice += option.additionalPrice;
                    optionIdString = option.id;
                    if (option.stock < item.quantity) { res.status(400).json({ error: `옵션 재고가 부족합니다.` }); return; }
                }
            } else {
                if (product.stock < item.quantity) { res.status(400).json({ error: `재고가 부족합니다.` }); return; }
            }

            totalAmount += itemPrice * item.quantity;
            orderItemsData.push({ productId: product.id, optionId: optionIdString, quantity: item.quantity, price: itemPrice });
        }

        let discountAmount = 0;
        let finalAmount = totalAmount;
        let appliedCouponCode: string | undefined = undefined;

        // 쿠폰코드로 조회 (couponId 대신 couponCode 사용)
        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({ where: { code: String(couponCode).toUpperCase().trim() } });
            if (coupon && coupon.expiresAt.getTime() > Date.now() && totalAmount >= coupon.minOrderAmount) {
                if (coupon.discountType === 'PERCENT') {
                    discountAmount = Math.floor(totalAmount * (coupon.discountValue / 100));
                } else {
                    discountAmount = coupon.discountValue;
                }
                finalAmount = totalAmount - discountAmount;
                appliedCouponCode = coupon.code;
            }
        }

        const idString = `o_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        const order = await prisma.order.create({
            data: {
                id: idString,
                userId: String(userId),
                totalAmount,
                discountAmount,
                finalAmount,
                status: 'PENDING',
                shippingAddress: shippingAddress || null,
                couponCode: appliedCouponCode || null,
                // 게스트 정보
                guestName: req.user ? null : (guestName || null),
                guestPhone: req.user ? null : (guestPhone || null),
                guestEmail: req.user ? null : (guestEmail || null),
                items: { create: orderItemsData }
            },
            include: { items: true }
        });

        res.status(201).json(order);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: '주문 생성에 실패했습니다.' });
    }
});

// GET /api/orders/my - 내 주문 목록
router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: String(req.user!.id) },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: '주문 조회에 실패했습니다.' });
    }
});

// POST /api/orders/:id/pay - MVP 모의 결제 확인 (Toss 없이 즉시 PAID 처리)
router.post('/:id/pay', optionalAuthenticate, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const order = await prisma.order.findUnique({ where: { id: String(id) }, include: { items: true } });
        if (!order) { res.status(404).json({ error: '주문을 찾을 수 없습니다.' }); return; }
        if (order.status !== 'PENDING') { res.status(400).json({ error: '이미 처리된 주문입니다.' }); return; }

        await prisma.order.update({ where: { id: String(id) }, data: { status: 'PAID' } });

        // 재고 차감
        for (const item of order.items) {
            if (item.optionId) {
                await prisma.productOption.update({ where: { id: item.optionId }, data: { stock: { decrement: item.quantity } } }).catch(() => {});
            } else {
                await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } }).catch(() => {});
            }
        }

        res.json({ message: '결제가 완료되었습니다.', orderId: id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '결제 처리에 실패했습니다.' });
    }
});

// POST /api/orders/confirm - 토스 결제 확인
router.post('/confirm', authenticate, async (req: AuthRequest, res: Response) => {
    const { paymentKey, orderId, amount } = req.body;

    try {
        const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
        if (!order) { res.status(404).json({ message: '주문을 찾을 수 없습니다.' }); return; }
        if (order.finalAmount !== amount) { res.status(400).json({ message: '결제 금액이 일치하지 않습니다.' }); return; }
        if (order.status !== 'PENDING') { res.status(400).json({ message: '이미 처리된 주문입니다.' }); return; }

        const secretKey = process.env.TOSS_SECRET_KEY || 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R';
        const encryptedSecretKey = Buffer.from(`${secretKey}:`).toString('base64');

        const response = await axios.post('https://api.tosspayments.com/v1/payments/confirm', {
            paymentKey, orderId, amount
        }, {
            headers: { Authorization: `Basic ${encryptedSecretKey}`, 'Content-Type': 'application/json' }
        });

        if (response.status === 200) {
            await prisma.order.update({ where: { id: order.id }, data: { status: 'PAID', paymentKey } });

            for (const item of order.items) {
                if (item.optionId) {
                    await prisma.productOption.update({ where: { id: item.optionId }, data: { stock: { decrement: item.quantity } } });
                } else {
                    await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
                }
            }

            res.json({ message: '결제가 완료되었습니다.' });
        }
    } catch (error: any) {
        console.error('Payment Error:', error?.response?.data || error.message);
        await prisma.order.update({ where: { id: orderId }, data: { status: 'FAILED' } }).catch(() => {});
        res.status(400).json({ error: '결제 처리에 실패했습니다.' });
    }
});

export default router;

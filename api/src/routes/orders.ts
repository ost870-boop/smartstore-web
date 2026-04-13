import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, optionalAuthenticate, AuthRequest } from '../middlewares/auth.middleware';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

const router = Router();

// 주문 생성 rate limit: IP당 1시간에 20회
const orderLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, max: 20,
    message: { error: '주문 요청이 너무 많습니다.' },
});

// POST /api/orders - 주문 생성
router.post('/', orderLimiter, optionalAuthenticate, async (req: AuthRequest, res: Response) => {
    const { items, couponCode, shippingAddress, guestName, guestPhone, guestEmail } = req.body;

    try {
        // ── 입력 검증 ─────────────────────────────────
        if (!items || !Array.isArray(items) || items.length === 0 || items.length > 50) {
            res.status(400).json({ error: '주문 상품이 올바르지 않습니다.' }); return;
        }

        let userId: string | undefined = req.user?.id;
        if (!userId) {
            // 게스트: upsert로 race condition 방지
            const guestUser = await prisma.user.upsert({
                where: { email: 'guest@smartstore.com' },
                update: {},
                create: { email: 'guest@smartstore.com', password: crypto.randomBytes(32).toString('hex'), role: 'GUEST', name: '비회원' }
            });
            userId = guestUser.id;
        }

        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
            // ── 수량 검증 (음수/0/소수/비숫자 차단) ────
            const qty = Math.floor(Number(item.quantity));
            if (!Number.isFinite(qty) || qty <= 0 || qty > 9999) {
                res.status(400).json({ error: '수량이 올바르지 않습니다.' }); return;
            }

            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) { res.status(404).json({ error: '상품을 찾을 수 없습니다.' }); return; }

            let itemPrice = product.price; // 서버 DB 가격 사용 (클라이언트 값 무시)
            let optionIdString: string | undefined = undefined;

            if (item.optionId) {
                const option = await prisma.productOption.findUnique({ where: { id: item.optionId } });
                if (!option) { res.status(404).json({ error: '옵션을 찾을 수 없습니다.' }); return; }
                itemPrice += option.additionalPrice;
                optionIdString = option.id;
                if (option.stock < qty) { res.status(400).json({ error: `옵션 재고가 부족합니다. (${option.value}: ${option.stock}개 남음)` }); return; }
            } else {
                if (product.stock < qty) { res.status(400).json({ error: `재고가 부족합니다. (${product.name}: ${product.stock}개 남음)` }); return; }
            }

            totalAmount += itemPrice * qty;
            orderItemsData.push({ productId: product.id, optionId: optionIdString, quantity: qty, price: itemPrice });
        }

        // ── 총액 검증 ──────────────────────────────────
        if (totalAmount <= 0) { res.status(400).json({ error: '주문 금액이 올바르지 않습니다.' }); return; }

        let discountAmount = 0;
        let finalAmount = totalAmount;
        let appliedCouponCode: string | undefined = undefined;

        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({ where: { code: String(couponCode).toUpperCase().trim() } });
            if (coupon && coupon.expiresAt.getTime() > Date.now() && totalAmount >= coupon.minOrderAmount) {
                discountAmount = coupon.discountType === 'PERCENT'
                    ? Math.floor(totalAmount * (coupon.discountValue / 100))
                    : coupon.discountValue;
                finalAmount = Math.max(0, totalAmount - discountAmount); // 최소 0원
                appliedCouponCode = coupon.code;
            }
        }

        // ── 주문 ID: crypto로 예측 불가능하게 ──────────
        const orderId = `o_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

        const order = await prisma.order.create({
            data: {
                id: orderId,
                userId: String(userId),
                totalAmount, discountAmount, finalAmount,
                status: 'PENDING',
                shippingAddress: shippingAddress ? String(shippingAddress).substring(0, 500) : null,
                couponCode: appliedCouponCode || null,
                guestName: req.user ? null : (guestName ? String(guestName).substring(0, 50) : null),
                guestPhone: req.user ? null : (guestPhone ? String(guestPhone).substring(0, 20) : null),
                guestEmail: req.user ? null : (guestEmail ? String(guestEmail).substring(0, 100) : null),
                items: { create: orderItemsData }
            },
            include: { items: true }
        });

        res.status(201).json(order);
    } catch (error) {
        console.error('[Order Create]', error);
        res.status(400).json({ error: '주문 생성에 실패했습니다.' });
    }
});

// GET /api/orders/my - 내 주문 목록
router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: String(req.user!.id) },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50, // 최대 50건
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: '주문 조회에 실패했습니다.' });
    }
});

// POST /api/orders/:id/pay - MVP 모의 결제
router.post('/:id/pay', optionalAuthenticate, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        // 트랜잭션 안에서 조회 + 상태 변경 + 재고 차감을 원자적으로
        await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({ where: { id: String(id) }, include: { items: true } });
            if (!order) throw new Error('NOT_FOUND');
            if (order.status !== 'PENDING') throw new Error('ALREADY_PROCESSED');
            // 소유권: 로그인 사용자는 자기 주문만, 게스트는 게스트 주문만
            if (req.user && order.userId !== req.user.id) throw new Error('FORBIDDEN');
            if (!req.user) {
                const guestUser = await tx.user.findUnique({ where: { email: 'guest@smartstore.com' } });
                if (!guestUser || order.userId !== guestUser.id) throw new Error('FORBIDDEN');
            }

            await tx.order.update({ where: { id: String(id) }, data: { status: 'PAID' } });
            for (const item of order.items) {
                if (item.optionId) {
                    const opt = await tx.productOption.update({ where: { id: item.optionId }, data: { stock: { decrement: item.quantity } } });
                    if (opt.stock < 0) throw new Error('STOCK_INSUFFICIENT');
                } else {
                    const prod = await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
                    if (prod.stock < 0) throw new Error('STOCK_INSUFFICIENT');
                }
            }
        });
        res.json({ message: '결제가 완료되었습니다.', orderId: id });
    } catch (error: any) {
        const msg = error?.message;
        if (msg === 'NOT_FOUND') { res.status(404).json({ error: '주문을 찾을 수 없습니다.' }); return; }
        if (msg === 'ALREADY_PROCESSED') { res.status(400).json({ error: '이미 처리된 주문입니다.' }); return; }
        if (msg === 'FORBIDDEN') { res.status(403).json({ error: '권한이 없습니다.' }); return; }
        if (msg === 'STOCK_INSUFFICIENT') { res.status(400).json({ error: '재고가 부족합니다.' }); return; }
        res.status(500).json({ error: '결제 처리에 실패했습니다.' });
    }
});

// POST /api/orders/confirm - 토스 결제 확인 (서버 승인)
router.post('/confirm', optionalAuthenticate, async (req: AuthRequest, res: Response) => {
    const { paymentKey, orderId, amount } = req.body;

    try {
        const secretKey = process.env.TOSS_SECRET_KEY;
        if (!secretKey) { res.status(500).json({ message: '결제 설정이 되지 않았습니다.' }); return; }

        // 트랜잭션으로 전체 처리
        await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
            if (!order) throw new Error('NOT_FOUND');
            if (order.finalAmount !== amount) throw new Error('AMOUNT_MISMATCH');
            if (order.status !== 'PENDING') throw new Error('ALREADY_PROCESSED');
            // 소유권 검증
            if (req.user && order.userId !== req.user.id) throw new Error('FORBIDDEN');

            // 토스 결제 승인
            const encryptedSecretKey = Buffer.from(`${secretKey}:`).toString('base64');
            const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
                method: 'POST',
                headers: { Authorization: `Basic ${encryptedSecretKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentKey, orderId, amount }),
            });
            if (!tossRes.ok) throw new Error('PAYMENT_FAILED');

            await tx.order.update({ where: { id: order.id }, data: { status: 'PAID', paymentKey } });
            for (const item of order.items) {
                if (item.optionId) {
                    const opt = await tx.productOption.update({ where: { id: item.optionId }, data: { stock: { decrement: item.quantity } } });
                    if (opt.stock < 0) throw new Error('STOCK_INSUFFICIENT');
                } else {
                    const prod = await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
                    if (prod.stock < 0) throw new Error('STOCK_INSUFFICIENT');
                }
            }
        });
        res.json({ message: '결제가 완료되었습니다.' });
    } catch (error: any) {
        console.error('[Payment Error]', error?.message);
        if (error?.message === 'AMOUNT_MISMATCH') { res.status(400).json({ error: '결제 금액이 일치하지 않습니다.' }); return; }
        await prisma.order.update({ where: { id: orderId }, data: { status: 'FAILED' } }).catch(() => {});
        res.status(400).json({ error: '결제 처리에 실패했습니다.' });
    }
});

export default router;

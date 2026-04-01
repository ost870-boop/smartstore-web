import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import axios from 'axios';

const router = Router();

// Create order (Pending)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    const { items, couponId } = req.body; // Array of { productId, optionId, quantity }
    const userId = req.user!.id;

    try {
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) { res.status(404).json({ error: `Product not found` }); return; }
            
            let itemPrice = product.price;
            let optionIdString = undefined;

            if (item.optionId) {
                const option = await prisma.productOption.findUnique({ where: { id: item.optionId } });
                if (option) {
                    itemPrice += option.additionalPrice;
                    optionIdString = option.id;
                    if (option.stock < item.quantity) { res.status(400).json({ error: `Not enough stock for option` }); return; }
                }
            } else {
                if (product.stock < item.quantity) { res.status(400).json({ error: `Not enough stock` }); return; }
            }

            totalAmount += itemPrice * item.quantity;
            orderItemsData.push({
                productId: product.id,
                optionId: optionIdString,
                quantity: item.quantity,
                price: itemPrice
            });
        }

        let discountAmount = 0;
        let finalAmount = totalAmount;

        // Apply coupon logic
        if (couponId) {
            const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
            if (coupon && coupon.isActive && totalAmount >= coupon.minOrderAmount) {
                if (coupon.discountType === 'PERCENT') {
                    discountAmount = Math.floor(totalAmount * (coupon.value / 100));
                } else {
                    discountAmount = coupon.value;
                }
                finalAmount = totalAmount - discountAmount;
            }
        }

        const idString = `o_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        const order = await prisma.order.create({
            data: {
                id: idString,
                userId,
                totalAmount,
                discountAmount,
                finalAmount,
                status: 'PENDING',
                items: {
                    create: orderItemsData
                }
            },
            include: { items: true }
        });

        res.status(201).json(order);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Failed to create order' });
    }
});

// Confirm Toss Payment
router.post('/confirm', authenticate, async (req: AuthRequest, res: Response) => {
    const { paymentKey, orderId, amount } = req.body;

    try {
        const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
        if (!order) { res.status(404).json({ message: 'Order not found' }); return; }
        
        if (order.finalAmount !== amount) { res.status(400).json({ message: 'Amount mismatch' }); return; }
        if (order.status !== 'PENDING') { res.status(400).json({ message: 'Order is not pending' }); return; }

        const secretKey = process.env.TOSS_SECRET_KEY || 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R';
        const encryptedSecretKey = Buffer.from(`${secretKey}:`).toString('base64');

        const response = await axios.post('https://api.tosspayments.com/v1/payments/confirm', {
            paymentKey,
            orderId,
            amount
        }, {
            headers: {
                Authorization: `Basic ${encryptedSecretKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            await prisma.order.update({
                where: { id: order.id },
                data: { status: 'PAID', paymentKey }
            });

            // Adjust inventory
            for (const item of order.items) {
                if (item.optionId) {
                    await prisma.productOption.update({
                        where: { id: item.optionId },
                        data: { stock: { decrement: item.quantity } }
                    });
                } else {
                    await prisma.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } }
                    });
                }
            }

            res.json({ message: 'Payment confirmed successfully' });
            return;
        }

    } catch (error: any) {
        console.error('Payment Error: ', error?.response?.data || error.message);
        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'FAILED' }
        });
        res.status(400).json({ error: 'Payment failed' });
    }
});

export default router;

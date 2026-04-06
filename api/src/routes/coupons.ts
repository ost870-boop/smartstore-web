import { Router, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// 쿠폰 코드 유효성 검사 (프론트 체크아웃에서 호출)
router.get('/validate/:code', async (req, res: Response) => {
    const { code } = req.params;
    const { amount } = req.query;

    try {
        const coupon = await prisma.coupon.findUnique({ where: { code } });

        if (!coupon) {
            res.status(404).json({ valid: false, message: '존재하지 않는 쿠폰입니다.' });
            return;
        }

        if (coupon.expiresAt.getTime() < Date.now()) {
            res.status(400).json({ valid: false, message: '만료된 쿠폰입니다.' });
            return;
        }

        const orderAmount = Number(amount) || 0;
        if (orderAmount < coupon.minOrderAmount) {
            res.status(400).json({
                valid: false,
                message: `최소 주문금액 ${coupon.minOrderAmount.toLocaleString()}원 이상일 때 사용 가능합니다.`
            });
            return;
        }

        let discountAmount = 0;
        if (coupon.discountType === 'PERCENT') {
            discountAmount = Math.floor(orderAmount * (coupon.discountValue / 100));
        } else {
            discountAmount = coupon.discountValue;
        }

        res.json({
            valid: true,
            couponId: coupon.id,
            couponCode: coupon.code,
            name: coupon.name,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount,
            message: `쿠폰이 적용되었습니다! (-${discountAmount.toLocaleString()}원)`
        });
    } catch (error) {
        res.status(500).json({ valid: false, message: '쿠폰 확인 중 오류가 발생했습니다.' });
    }
});

export default router;

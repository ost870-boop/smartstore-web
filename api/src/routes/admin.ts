import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireAdmin, AuthRequest } from '../middlewares/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 업로드 폴더 생성
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `img_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ok = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
        ok ? cb(null, true) : cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
});

const router = Router();

// ─── 대시보드 ────────────────────────────────────────────────────────────────

router.get('/dashboard', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const paidStatuses = ['PAID', 'SHIPPING', 'COMPLETED'];

        const [paidCount, pendingCount, shippingCount, completedCount, cancelledCount,
               totalRevenue, todayRevenue, weekRevenue, monthRevenue,
               todayOrders, recentOrders, topItems] = await Promise.all([
            prisma.order.count({ where: { status: 'PAID' } }),
            prisma.order.count({ where: { status: 'PENDING' } }),
            prisma.order.count({ where: { status: 'SHIPPING' } }),
            prisma.order.count({ where: { status: 'COMPLETED' } }),
            prisma.order.count({ where: { status: 'CANCELLED' } }),
            prisma.order.aggregate({ where: { status: { in: paidStatuses } }, _sum: { finalAmount: true } }),
            prisma.order.aggregate({ where: { status: { in: paidStatuses }, createdAt: { gte: todayStart } }, _sum: { finalAmount: true } }),
            prisma.order.aggregate({ where: { status: { in: paidStatuses }, createdAt: { gte: weekStart } }, _sum: { finalAmount: true } }),
            prisma.order.aggregate({ where: { status: { in: paidStatuses }, createdAt: { gte: monthStart } }, _sum: { finalAmount: true } }),
            prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
            prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } }, items: { include: { product: { select: { name: true } } } } } }),
            prisma.orderItem.groupBy({ by: ['productId'], _sum: { quantity: true, price: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 5 }),
        ]);

        // TOP5 상품명 조회
        const topProductIds = topItems.map((t: any) => t.productId);
        const topProducts = await prisma.product.findMany({ where: { id: { in: topProductIds } }, select: { id: true, name: true } });
        const topProductMap = Object.fromEntries(topProducts.map(p => [p.id, p.name]));

        // 최근 7일 매출 추이
        const dailySales = [];
        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date(todayStart); dayStart.setDate(dayStart.getDate() - i);
            const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);
            const daySales = await prisma.order.aggregate({
                where: { status: { in: paidStatuses }, createdAt: { gte: dayStart, lt: dayEnd } },
                _sum: { finalAmount: true }, _count: true
            });
            dailySales.push({
                date: dayStart.toISOString().slice(5, 10),
                revenue: daySales._sum.finalAmount ?? 0,
                orders: daySales._count ?? 0,
            });
        }

        res.json({
            paid: paidCount, pending: pendingCount, shipping: shippingCount,
            completed: completedCount, cancelled: cancelledCount,
            totalRevenue: totalRevenue._sum.finalAmount ?? 0,
            todayRevenue: todayRevenue._sum.finalAmount ?? 0,
            weekRevenue: weekRevenue._sum.finalAmount ?? 0,
            monthRevenue: monthRevenue._sum.finalAmount ?? 0,
            todayOrders,
            recentOrders: recentOrders.map((o: any) => ({
                id: o.id, status: o.status, finalAmount: o.finalAmount, createdAt: o.createdAt,
                customerName: o.user?.name || o.guestName || '비회원',
                productSummary: o.items?.[0]?.product?.name + (o.items.length > 1 ? ` 외 ${o.items.length - 1}건` : ''),
            })),
            topProducts: topItems.map((t: any) => ({
                productId: t.productId, name: topProductMap[t.productId] || '삭제된 상품',
                totalQty: t._sum.quantity, totalRevenue: t._sum.price,
            })),
            dailySales,
        });
    } catch (error) {
        console.error('[Dashboard]', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// ─── 주문 CSV 다운로드 ──────────────────────────────────────────────────────

router.get('/orders/csv', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            include: { user: { select: { name: true, email: true } }, items: { include: { product: { select: { name: true } } } } },
            orderBy: { createdAt: 'desc' }
        });

        const BOM = '\uFEFF';
        const header = '주문일시,주문번호,주문자,이메일,상품명,수량,결제금액,결제상태\n';
        const rows = orders.map((o: any) => {
            const productName = o.items.map((i: any) => `${i.product?.name || ''}(${i.quantity}개)`).join(' / ');
            const totalQty = o.items.reduce((s: number, i: any) => s + i.quantity, 0);
            const date = new Date(o.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
            return `"${date}","${o.id}","${o.user?.name || o.guestName || '비회원'}","${o.user?.email || o.guestEmail || ''}","${productName}",${totalQty},${o.finalAmount},"${o.status}"`;
        }).join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=orders_${new Date().toISOString().slice(0, 10)}.csv`);
        res.send(BOM + header + rows);
    } catch (error) {
        res.status(500).json({ error: 'CSV 생성 실패' });
    }
});

// ─── 주문 관리 ───────────────────────────────────────────────────────────────

router.get('/orders', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            include: { user: true, items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

router.put('/orders/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { status, trackingNumber } = req.body;
        const updated = await prisma.order.update({
            where: { id: String(req.params.id) },
            data: { status, trackingNumber: trackingNumber ? String(trackingNumber) : undefined }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// ─── 이미지 업로드 ────────────────────────────────────────────────────────────

// POST /api/admin/upload - 이미지 업로드 (단일)
router.post('/upload', authenticate, requireAdmin, upload.single('image'), (req: AuthRequest, res: Response) => {
    if (!req.file) {
        res.status(400).json({ error: '파일이 없습니다.' });
        return;
    }
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const url = `${baseUrl}/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
});

// POST /api/admin/upload/multiple - 이미지 다중 업로드 (최대 10장)
router.post('/upload/multiple', authenticate, requireAdmin, upload.array('images', 10), (req: AuthRequest, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
        res.status(400).json({ error: '파일이 없습니다.' });
        return;
    }
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const urls = files.map(f => ({
        url: `${baseUrl}/uploads/${f.filename}`,
        filename: f.filename
    }));
    res.json({ urls });
});

// DELETE /api/admin/upload/:filename - 업로드된 이미지 삭제
router.delete('/upload/:filename', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
    const filename = req.params.filename;
    // 경로 탐색 공격 방지
    if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
        res.status(400).json({ error: '유효하지 않은 파일명입니다.' });
        return;
    }
    const filePath = path.join(uploadDir, String(filename));
    if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
        return;
    }
    fs.unlinkSync(filePath);
    res.json({ message: '삭제되었습니다.' });
});

// ─── 쿠폰 관리 ───────────────────────────────────────────────────────────────

// GET /api/admin/coupons - 전체 쿠폰 목록
router.get('/coupons', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
    try {
        const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch coupons' });
    }
});

// POST /api/admin/coupons - 쿠폰 생성
router.post('/coupons', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { code, name, discountType, discountValue, minOrderAmount, expiresAt } = req.body;
        if (!code || !name || !discountType || !discountValue || !expiresAt) {
            res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
            return;
        }
        const existing = await prisma.coupon.findUnique({ where: { code } });
        if (existing) {
            res.status(400).json({ error: '이미 존재하는 쿠폰 코드입니다.' });
            return;
        }
        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase().trim(),
                name,
                discountType,
                discountValue: Number(discountValue),
                minOrderAmount: Number(minOrderAmount) || 0,
                expiresAt: new Date(expiresAt)
            }
        });
        res.status(201).json(coupon);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create coupon' });
    }
});

// PUT /api/admin/coupons/:id - 쿠폰 수정
router.put('/coupons/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { name, discountType, discountValue, minOrderAmount, expiresAt } = req.body;
        const updated = await prisma.coupon.update({
            where: { id: String(req.params.id) },
            data: {
                name,
                discountType,
                discountValue: discountValue ? Number(discountValue) : undefined,
                minOrderAmount: minOrderAmount !== undefined ? Number(minOrderAmount) : undefined,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined
            }
        });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update coupon' });
    }
});

// DELETE /api/admin/coupons/:id - 쿠폰 삭제
router.delete('/coupons/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.coupon.delete({ where: { id: String(req.params.id) } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete coupon' });
    }
});

// ─── 리뷰 관리 ───────────────────────────────────────────────────────────────

// GET /api/admin/reviews - 전체 리뷰 목록
router.get('/reviews', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
    try {
        const reviews = await prisma.review.findMany({
            include: { product: { select: { name: true } }, user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// DELETE /api/admin/reviews/:id - 리뷰 삭제
router.delete('/reviews/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.review.delete({ where: { id: String(req.params.id) } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete review' });
    }
});

// ─── Q&A 관리 ────────────────────────────────────────────────────────────────

// GET /api/admin/qnas - 전체 문의 목록
router.get('/qnas', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
    try {
        const qnas = await prisma.qnA.findMany({
            include: { product: { select: { name: true } }, user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(qnas);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Q&As' });
    }
});

// PUT /api/admin/qnas/:id/reply - Q&A 답변 등록
router.put('/qnas/:id/reply', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { reply } = req.body;
        if (!reply?.trim()) { res.status(400).json({ error: '답변 내용을 입력해주세요.' }); return; }
        const updated = await prisma.qnA.update({
            where: { id: String(req.params.id) },
            data: { reply: reply.trim() }
        });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: 'Failed to reply' });
    }
});

// DELETE /api/admin/qnas/:id - Q&A 삭제
router.delete('/qnas/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.qnA.delete({ where: { id: String(req.params.id) } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete Q&A' });
    }
});

export default router;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import categoryRoutes from './routes/categories';
import adminRoutes from './routes/admin';
import couponRoutes from './routes/coupons';
import chatRoutes from './routes/chat';
import oauthRoutes from './routes/oauth';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

// ─── 보안 헤더 (XSS, clickjacking, MIME sniffing 방지) ──────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // 이미지 서빙용
    contentSecurityPolicy: false, // API 서버이므로 CSP 불필요
}));

// ─── CORS (허용 도메인만) ────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || '').split(',').filter(Boolean);
app.use(cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true
}));

// ─── 전역 Rate Limiting (IP당 분당 100회) ───────────────────────
app.use(rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
    standardHeaders: true,
    legacyHeaders: false,
}));

app.use(express.json({ limit: '10mb' }));

// 업로드 이미지 정적 서빙
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── 라우트 ──────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/oauth', oauthRoutes);

// 매일 00:00 재고 부족 알림
cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running daily automation tasks...');
    const lowStock = await prisma.product.findMany({ where: { stock: { lt: 5 } } });
    if (lowStock.length > 0) {
        console.log(`[ALERT] 재고 부족 상품 ${lowStock.length}개:`);
        lowStock.forEach(p => console.log(`  - ${p.name} (재고: ${p.stock}개)`));
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

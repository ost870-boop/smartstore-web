import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
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

app.use(cors({
    origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : true,
    credentials: true
}));
app.use(express.json());

// 업로드 이미지 정적 서빙
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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

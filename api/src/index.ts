import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import categoryRoutes from './routes/categories';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

// Automation: Daily report & low stock notification
cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running daily automation tasks...');
    const lowStock = await prisma.product.findMany({ where: { stock: { lt: 5 } } });
    if (lowStock.length > 0) {
        console.log(`[ALERT] Low stock for ${lowStock.length} items`);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

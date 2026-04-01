import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Get all products with filters and sorting
router.get('/', async (req, res) => {
    try {
        const { categoryId, search, minPrice, maxPrice, sort } = req.query;
        
        const where: any = {};
        if (categoryId) where.categoryId = String(categoryId);
        if (search) where.name = { contains: String(search) };
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = Number(minPrice);
            if (maxPrice) where.price.lte = Number(maxPrice);
        }

        let orderBy: any = { createdAt: 'desc' };
        if (sort === 'price_asc') orderBy = { price: 'asc' };
        if (sort === 'price_desc') orderBy = { price: 'desc' };
        if (sort === 'popular') orderBy = { orderItems: { _count: 'desc' } };

        const products = await prisma.product.findMany({
            where,
            orderBy,
            include: {
                images: { where: { isThumbnail: true } },
                category: true,
                _count: { select: { reviews: true } }
            }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product with deep relations
router.get('/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: {
                images: true,
                options: true,
                category: true,
                reviews: {
                    include: { user: { select: { name: true, email: true } } },
                    orderBy: { createdAt: 'desc' }
                },
                qnas: {
                    include: { user: { select: { name: true, email: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!product) {
            res.status(404).json({ message: 'Not found' });
            return;
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' });
    }
});

// Create product (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const product = await prisma.product.create({
            data: req.body
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create product' });
    }
});

// Update product (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update' });
    }
});

// Delete product (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        await prisma.product.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete' });
    }
});

export default router;

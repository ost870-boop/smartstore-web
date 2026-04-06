import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Get all products with filters and sorting
router.get('/', async (req, res) => {
    try {
        const { categoryId, search, minPrice, maxPrice, sort, brand, material, usage } = req.query;
        
        const where: any = {};
        if (categoryId) where.categoryId = String(categoryId);
        if (search) where.name = { contains: String(search) };
        if (brand) where.brand = String(brand);
        if (material) where.material = String(material);
        if (usage) where.usage = String(usage);
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
                images: { orderBy: { order: 'asc' } },
                category: true,
                reviews: { select: { rating: true } },
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

// 허용 필드 화이트리스트 (스키마에 없는 필드 차단)
function pickProductFields(body: any) {
    const allowed = ['name', 'description', 'price', 'stock', 'status', 'imageUrl', 'categoryId',
        'brand', 'material', 'usage', 'isBoxRate', 'boxQuantity', 'bulkPrice',
        'descriptionBlocks', 'originalPrice'];
    const data: any = {};
    for (const key of allowed) {
        if (body[key] !== undefined) data[key] = body[key];
    }
    return data;
}

router.post('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const data = pickProductFields(req.body);
        const { imagesText } = req.body;
        if (imagesText) {
            const urls = imagesText.split(',').map((u: string) => u.trim()).filter(Boolean);
            if (urls.length > 0) {
                data.images = { create: urls.map((url: string, order: number) => ({ url, order })) };
            }
        }
        const product = await prisma.product.create({ data });
        res.status(201).json(product);
    } catch (error) {
        console.error('[Product Create]', error);
        res.status(400).json({ error: 'Failed to create product' });
    }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const data = pickProductFields(req.body);
        const { imagesText } = req.body;
        if (imagesText !== undefined) {
            const urls = imagesText.split(',').map((u: string) => u.trim()).filter(Boolean);
            data.images = {
                deleteMany: {},
                create: urls.map((url: string, order: number) => ({ url, order }))
            };
        }
        const product = await prisma.product.update({
            where: { id: String(req.params.id) },
            data
        });
        res.json(product);
    } catch (error) {
        console.error('[Product Update]', error);
        res.status(400).json({ error: 'Failed to update' });
    }
});

// Delete product (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        await prisma.product.delete({
            where: { id: String(req.params.id) }
        });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete' });
    }
});

export default router;

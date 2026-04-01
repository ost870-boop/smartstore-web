import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// Get all categories in hierarchy
router.get('/', async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { parentId: null },
            include: { children: true }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

export default router;

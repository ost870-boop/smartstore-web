import { Router } from 'express';
import { prisma } from '../index';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/register', async (req, res) => {
    const { email, password, role, name, phone, address } = req.body;
    try {
        if (!email || !password || !name) {
            return res.status(400).json({ message: '이름, 이메일, 비밀번호는 필수입니다.' });
        }
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, role: role || 'USER', name, phone: phone || null, address: address || null, provider: 'LOCAL' }
        });

        res.status(201).json({ message: '회원가입이 완료되었습니다.', userId: user.id });
    } catch (error) {
        res.status(400).json({ message: '회원가입에 실패했습니다.' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET || 'smartstore_secret', 
            { expiresIn: '1d' }
        );
        res.json({ token, role: user.role });
    } catch (error) {
        res.status(400).json({ error: 'Login failed' });
    }
});

// GET /api/auth/me - 로그인된 사용자 정보 조회
router.get('/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: '로그인이 필요합니다.' });

    try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartstore_secret') as any;
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, name: true, email: true, phone: true, address: true, role: true }
        });
        if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        res.json(user);
    } catch {
        res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
});

export default router;

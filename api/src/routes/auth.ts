import { Router } from 'express';
import { prisma } from '../index';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'smartstore_secret';

// 로그인 brute force 방지: IP당 15분에 10회
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// 회원가입 rate limiting: IP당 1시간에 5회
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { message: '회원가입 요청이 너무 많습니다. 1시간 후 다시 시도해주세요.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/register', registerLimiter, async (req, res) => {
    const { email, password, role, name, phone, address } = req.body;
    try {
        // 입력 검증
        if (!email || !password || !name) {
            return res.status(400).json({ message: '이름, 이메일, 비밀번호는 필수입니다.' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: '올바른 이메일 형식이 아닙니다.' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: '비밀번호는 8자 이상이어야 합니다.' });
        }
        if (name.length > 50 || email.length > 100) {
            return res.status(400).json({ message: '입력값이 너무 깁니다.' });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });

        const hashedPassword = await bcrypt.hash(password, 12); // 12 rounds
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, role: role === 'ADMIN' ? 'USER' : (role || 'USER'), name, phone: phone || null, address: address || null, provider: 'LOCAL' }
        });

        res.status(201).json({ message: '회원가입이 완료되었습니다.', userId: user.id });
    } catch (error) {
        res.status(400).json({ message: '회원가입에 실패했습니다.' });
    }
});

router.post('/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
    }
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
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
        const decoded = jwt.verify(token, JWT_SECRET) as any;
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

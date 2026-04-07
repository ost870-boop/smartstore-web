import { Router } from 'express';
import { prisma } from '../index';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/register', async (req, res) => {
    const { email, password, role, name, phone } = req.body;
    try {
        if (!email || !password || !name) {
            return res.status(400).json({ message: '이름, 이메일, 비밀번호는 필수입니다.' });
        }
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, role: role || 'USER', name, phone: phone || null, provider: 'LOCAL' }
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
            process.env.JWT_SECRET || 'supersecretjwtkey', 
            { expiresIn: '1d' }
        );
        res.json({ token, role: user.role });
    } catch (error) {
        res.status(400).json({ error: 'Login failed' });
    }
});

export default router;

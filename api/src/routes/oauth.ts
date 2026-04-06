import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'smartstore_secret';

function generateToken(user: { id: string; role: string }) {
    return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

// 동일 이메일 계정 연동 또는 신규 생성
async function findOrCreateUser(profile: { email: string; name: string; provider: string; providerId: string; profileImage?: string }) {
    // 1. 기존 이메일로 찾기 (계정 연동)
    let user = await prisma.user.findUnique({ where: { email: profile.email } });

    if (user) {
        // 기존 계정에 소셜 정보 연동 (provider가 없으면 업데이트)
        if (!user.provider || user.provider === 'LOCAL') {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { provider: profile.provider, providerId: profile.providerId, profileImage: profile.profileImage },
            });
        }
        return user;
    }

    // 2. 신규 생성
    const randomPw = await bcrypt.hash(Math.random().toString(36), 10);
    user = await prisma.user.create({
        data: {
            email: profile.email,
            name: profile.name,
            password: randomPw,
            role: 'USER',
            provider: profile.provider,
            providerId: profile.providerId,
            profileImage: profile.profileImage,
        },
    });
    return user;
}

// ─── 네이버 로그인 ────────────────────────────────────────────────

// GET /api/oauth/naver - 네이버 로그인 URL 생성
router.get('/naver', (_req: Request, res: Response) => {
    const clientId = process.env.NAVER_CLIENT_ID;
    if (!clientId) { res.status(500).json({ error: 'NAVER_CLIENT_ID가 설정되지 않았습니다.' }); return; }

    const redirectUri = encodeURIComponent(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/naver/callback`);
    const state = Math.random().toString(36).slice(2);
    const url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;
    res.json({ url, state });
});

// POST /api/oauth/naver/callback - 네이버 code → token → 사용자 정보
router.post('/naver/callback', async (req: Request, res: Response) => {
    const { code, state } = req.body;
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) { res.status(500).json({ error: '네이버 OAuth 설정이 없습니다.' }); return; }

    try {
        // 1. code → access_token
        const tokenUrl = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&code=${code}&state=${state}`;
        const tokenRes = await fetch(tokenUrl);
        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
            res.status(400).json({ error: '네이버 토큰 발급 실패' });
            return;
        }

        // 2. access_token → 사용자 정보
        const profileRes = await fetch('https://openapi.naver.com/v1/nid/me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const profileData = await profileRes.json();
        const naver = profileData.response;

        if (!naver?.email) {
            res.status(400).json({ error: '네이버에서 이메일 정보를 가져올 수 없습니다.' });
            return;
        }

        // 3. 사용자 생성 또는 연동
        const user = await findOrCreateUser({
            email: naver.email,
            name: naver.name || naver.nickname || '네이버사용자',
            provider: 'NAVER',
            providerId: naver.id,
            profileImage: naver.profile_image,
        });

        const token = generateToken(user);
        res.json({ token, role: user.role, name: user.name, provider: 'NAVER' });
    } catch (error) {
        console.error('[Naver OAuth Error]', error);
        res.status(500).json({ error: '네이버 로그인 처리 실패' });
    }
});

// ─── 카카오 로그인 ────────────────────────────────────────────────

// GET /api/oauth/kakao - 카카오 로그인 URL 생성
router.get('/kakao', (_req: Request, res: Response) => {
    const restApiKey = process.env.KAKAO_REST_API_KEY;
    if (!restApiKey) { res.status(500).json({ error: 'KAKAO_REST_API_KEY가 설정되지 않았습니다.' }); return; }

    const redirectUri = encodeURIComponent(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/kakao/callback`);
    const url = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${restApiKey}&redirect_uri=${redirectUri}`;
    res.json({ url });
});

// POST /api/oauth/kakao/callback - 카카오 code → token → 사용자 정보
router.post('/kakao/callback', async (req: Request, res: Response) => {
    const { code } = req.body;
    const restApiKey = process.env.KAKAO_REST_API_KEY;

    if (!restApiKey) { res.status(500).json({ error: '카카오 OAuth 설정이 없습니다.' }); return; }

    try {
        const redirectUri = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/kakao/callback`;

        // 1. code → access_token
        const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: restApiKey,
                redirect_uri: redirectUri,
                code,
            }),
        });
        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
            res.status(400).json({ error: '카카오 토큰 발급 실패' });
            return;
        }

        // 2. access_token → 사용자 정보
        const profileRes = await fetch('https://kapi.kakao.com/v2/user/me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const profileData = await profileRes.json();

        const email = profileData.kakao_account?.email;
        const name = profileData.kakao_account?.profile?.nickname || '카카오사용자';
        const profileImage = profileData.kakao_account?.profile?.profile_image_url;

        if (!email) {
            res.status(400).json({ error: '카카오에서 이메일 정보를 가져올 수 없습니다. 이메일 제공 동의가 필요합니다.' });
            return;
        }

        // 3. 사용자 생성 또는 연동
        const user = await findOrCreateUser({
            email,
            name,
            provider: 'KAKAO',
            providerId: String(profileData.id),
            profileImage,
        });

        const token = generateToken(user);
        res.json({ token, role: user.role, name: user.name, provider: 'KAKAO' });
    } catch (error) {
        console.error('[Kakao OAuth Error]', error);
        res.status(500).json({ error: '카카오 로그인 처리 실패' });
    }
});

export default router;

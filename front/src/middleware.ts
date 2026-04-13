import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'smartstore_secret');

async function verifyToken(token: string): Promise<{ role: string } | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as any;
    } catch {
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    // /admin 경로: JWT 서명 검증 + ADMIN role 확인
    if (pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
        }
        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'ADMIN') {
            // 위조된 쿠키 삭제 + 로그인 리다이렉트
            const res = NextResponse.redirect(new URL('/login?redirect=/admin', request.url));
            res.cookies.delete('token');
            res.cookies.delete('role');
            return res;
        }
    }

    // /mypage 경로: JWT 서명 검증
    if (pathname.startsWith('/mypage')) {
        if (!token) {
            return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
        }
        const payload = await verifyToken(token);
        if (!payload) {
            const res = NextResponse.redirect(new URL('/login?redirect=/mypage', request.url));
            res.cookies.delete('token');
            res.cookies.delete('role');
            return res;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/mypage/:path*'],
};

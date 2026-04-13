import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // /admin 경로 보호 — 서버사이드 쿠키 체크
    if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('token')?.value;
        const role = request.cookies.get('role')?.value;

        if (!token || role !== 'ADMIN') {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // /mypage 경로 보호
    if (pathname.startsWith('/mypage')) {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/mypage/:path*'],
};

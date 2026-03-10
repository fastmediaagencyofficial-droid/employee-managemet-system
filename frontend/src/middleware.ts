import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

    // Protected routes
    const protectedPaths = ['/dashboard'];
    const isProtectedPath = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    // If accessing protected route without token, redirect to login
    if (isProtectedPath && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If accessing login/signup with token, redirect to dashboard
    const authPaths = ['/login', '/signup'];
    const isAuthPath = authPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isAuthPath && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup'],
};

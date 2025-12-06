import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get token from cookie or authorization header
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    // Public routes
    const publicRoutes = ['/login', '/signup', '/'];
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // If accessing distributor or retailer routes
    if (pathname.startsWith('/distributor') || pathname.startsWith('/retailer')) {
        console.log('🔐 Middleware check for:', pathname);
        console.log('📝 Token from cookie:', cookieToken ? 'EXISTS' : 'MISSING');
        console.log('📝 Token from header:', authHeader ? 'EXISTS' : 'MISSING');

        if (!token) {
            console.log('❌ No token found, redirecting to login');
            return NextResponse.redirect(new URL('/login', request.url));
        }

        console.log('🔍 Verifying token...');
        const payload = await verifyToken(token);
        console.log('✅ Payload:', payload ? `role=${payload.role}` : 'NULL');

        if (!payload) {
            console.log('❌ Token verification failed, redirecting to login');
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Role-based access control
        if (pathname.startsWith('/distributor') && payload.role !== 'distributor') {
            console.log('⚠️ Wrong role for distributor route');
            return NextResponse.redirect(new URL('/retailer/dashboard', request.url));
        }

        if (pathname.startsWith('/retailer') && payload.role !== 'retailer') {
            console.log('⚠️ Wrong role for retailer route');
            return NextResponse.redirect(new URL('/distributor/dashboard', request.url));
        }

        console.log('✅ Auth successful for:', pathname);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};

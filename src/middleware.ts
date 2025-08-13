import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get token from cookies or headers
    const token = request.cookies.get('auth_token')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/register'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // API routes are handled by their own middleware
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Redirect to login if no token and trying to access protected route
    if (!token && !isPublicRoute && pathname !== '/') {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect to dashboard if authenticated and trying to access public routes
    if (token && isPublicRoute) {
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
};

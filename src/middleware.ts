import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const auth = request.cookies.get('auth');
    const { pathname } = request.nextUrl;

    // Se não estiver logado e tentar acessar qualquer página que não seja /login ou /forgot-password
    if (!auth && pathname !== '/login' && pathname !== '/forgot-password') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Se estiver logado e tentar acessar /login, redireciona para o dashboard
    if (auth && pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};

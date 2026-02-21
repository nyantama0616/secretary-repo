import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { AUTH_COOKIE_NAME } from '@/server/api/auth-constants';

const PUBLIC_PATHS = ['/login', '/api/auth/'];

export const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const hasApiKey = request.cookies.has(AUTH_COOKIE_NAME);
  if (!hasApiKey) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
};

export const config = {
  // NOTE: 静的アセットと Next.js 内部パスを除外する
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

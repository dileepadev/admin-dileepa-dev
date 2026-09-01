import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const payload = JSON.parse(json) as { exp?: number };
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  const isSignInPage = pathname === '/sign-in';
  const hasValidSession = session && !isExpired(session);

  // If user is logged in and trying to access sign-in page, redirect to dashboard
  if (isSignInPage && hasValidSession) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not logged in or session expired and not on sign-in page, redirect to sign-in
  // We exclude static files and api routes from this check just in case, though the matcher handles most
  if (!isSignInPage && !hasValidSession) {
    const response = NextResponse.redirect(new URL('/sign-in', request.url));
    if (session) {
      response.cookies.delete('session');
      response.cookies.delete('session_expires');
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

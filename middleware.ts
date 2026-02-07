import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  const isSignInPage = pathname === '/sign-in';

  // If user is logged in and trying to access sign-in page, redirect to dashboard
  if (isSignInPage && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not logged in and not on sign-in page, redirect to sign-in
  // We exclude static files and api routes from this check just in case, though the matcher handles most
  if (!isSignInPage && !session) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

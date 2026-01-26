import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/login";

  // If user is logged in and trying to access login page, redirect to dashboard
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is not logged in and not on login page, redirect to login
  // We exclude static files and api routes from this check just in case, though the matcher handles most
  if (!isLoginPage && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED = [/^\/dashboard(\/|$)/, /^\/editor(\/|$)/, /^\/settings(\/|$)/];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (!PROTECTED.some((re) => re.test(pathname))) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(req);
  if (sessionCookie) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname + search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*", "/settings/:path*"],
};

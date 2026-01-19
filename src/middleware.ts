import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { decodeJwt } from "jose";

const AUTH_COOKIE_NAME = "auth_token";
const publicPaths = ["/login"];
const apiPaths = ["/api"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (apiPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME);
  let isAuthenticated = false;

  if (token?.value) {
    try {
      const decoded = decodeJwt(token.value);
      if (decoded.exp && decoded.exp * 1000 > Date.now()) {
        isAuthenticated = true;
      }
    } catch {}
  }
  const isPublicPath = publicPaths.includes(pathname);

  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  if (isAuthenticated && pathname === "/login") {
    const homeUrl = new URL("/new-processing", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

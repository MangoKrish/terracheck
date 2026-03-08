import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

// Routes that require authentication
const PROTECTED_ROUTES = ["/assess", "/recommend", "/dashboard"];

export async function middleware(request: NextRequest) {
  // Let Auth0 handle /auth/* routes (login, logout, callback)
  const authResponse = await auth0.middleware(request);

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected) {
    // Check for Auth0 session cookie
    const sessionCookie = request.cookies.get("appSession");
    if (!sessionCookie) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

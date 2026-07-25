import { NextRequest, NextResponse } from "next/server";
import { COOKIE, verifyToken } from "@/lib/auth";

// Protect pages behind dashboard login. Public: login, auth routes, healthcheck.
// Lead webhook remains public but validates its own token inside the route.
const PUBLIC_PATHS = ["/login"];
const PUBLIC_PREFIXES = ["/api/auth", "/api/health"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }
  if (pathname === "/api/leads" && req.method === "POST") {
    return NextResponse.next();
  }
  if (PUBLIC_PATHS.includes(pathname) || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  const token = req.cookies.get(COOKIE)?.value;
  const session = token ? await verifyToken(token) : null;
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};

import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

const LEADER_ONLY_PREFIXES = ["/admin", "/api/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/login" || pathname.startsWith("/api/auth/login")) {
    return NextResponse.next();
  }

  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const isLeaderOnly = LEADER_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  if (isLeaderOnly && session.role !== "LEADER") {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Forbidden — Leader only" }, { status: 403 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match everything except:
     * - static assets (_next/static, _next/image, favicon.ico)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

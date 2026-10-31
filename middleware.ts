import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { canAccessDashboardPath } from "@/lib/auth/rbac";

const PUBLIC_PATHS = ["/", "/auth/login", "/api/auth/login", "/api/auth/register", "/api/public/doctors"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (pathname.startsWith("/dashboard") && !canAccessDashboardPath(pathname, payload.role)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*", "/prescriptions/:path*"],
};

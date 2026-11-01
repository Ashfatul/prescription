import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { canAccessDashboardPath } from "@/lib/auth/rbac";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token =
    req.cookies.get(AUTH_COOKIE)?.value ||
    req.cookies.get("ppms_session")?.value;

  const payload = token ? await verifyToken(token) : null;

  // If user is already authenticated and visits /auth/login or /auth/register, redirect to /dashboard
  if (pathname === "/auth/login" || pathname === "/auth/register") {
    if (payload) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Dashboard routes require valid auth
  if (pathname.startsWith("/dashboard")) {
    if (!payload) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    if (!canAccessDashboardPath(pathname, payload.role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Prescription print / view routes require auth (except public share route /p/:token)
  if (pathname.startsWith("/prescriptions")) {
    if (!payload) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  }

  // Protected API routes
  if (pathname.startsWith("/api")) {
    const isPublicApi =
      pathname === "/api/auth/login" ||
      pathname === "/api/auth/logout" ||
      pathname === "/api/auth/register" ||
      pathname === "/api/auth/verify-email" ||
      pathname === "/api/auth/resend-verification" ||
      pathname === "/api/auth/change-email" ||
      pathname === "/api/auth/forgot-password" ||
      pathname === "/api/auth/reset-password" ||
      pathname === "/api/stripe/webhook" ||
      pathname === "/api/public/doctors" ||
      pathname === "/api/pricing-plans" ||
      pathname.startsWith("/api/public/");

    if (!isPublicApi && !payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/login",
    "/auth/register",
    "/dashboard/:path*",
    "/api/:path*",
    "/prescriptions/:path*",
  ],
};

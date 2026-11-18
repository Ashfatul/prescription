import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { canAccessDashboardPath } from "@/lib/auth/rbac";
import { RESERVED_SLUGS } from "@/lib/organizations/slug";

function extractSubdomain(req: NextRequest): string | null {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const hostname = host.split(":")[0].toLowerCase();

  // If host ends with .localhost (e.g. metro-hospital.localhost)
  if (hostname.endsWith(".localhost")) {
    const parts = hostname.split(".");
    if (parts.length >= 2 && parts[0]) {
      const sub = parts[0];
      if (sub !== "www" && sub !== "app" && !(RESERVED_SLUGS as readonly string[]).includes(sub)) {
        return sub;
      }
    }
    return null;
  }

  // If plain localhost or raw IPv4, no subdomain
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname === "localhost") {
    return null;
  }

  // Vercel deployment URLs contain a project/deployment subdomain, but they
  // are still the application's public host and must not be treated as a
  // clinic tenant (for example, ppms.vercel.app -> /clinics/ppms).
  if (
    hostname.endsWith(".vercel.app") ||
    hostname.endsWith(".vercel.sh") ||
    hostname.endsWith(".now.sh")
  ) {
    return null;
  }

  // For domains like metro-hospital.ppms.local or clinic.example.com
  const parts = hostname.split(".");
  if (parts.length > 2) {
    const sub = parts[0];
    if (sub !== "www" && sub !== "app" && !(RESERVED_SLUGS as readonly string[]).includes(sub)) {
      return sub;
    }
  }

  return null;
}

function applySecurityHeaders(res: NextResponse, req?: NextRequest): NextResponse {
  const requestId = req?.headers.get("x-request-id") || crypto.randomUUID();
  res.headers.set("x-request-id", requestId);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );

  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const subdomain = extractSubdomain(req);

  // Setup request headers forwarding tenant context
  const requestHeaders = new Headers(req.headers);
  if (subdomain) {
    requestHeaders.set("x-clinic-slug", subdomain);
  }

  // SaaS Subdomain Routing:
  // If accessing a clinic subdomain at root "/", rewrite to the clinic's dedicated profile page
  if (subdomain && pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = `/clinics/${subdomain}`;
    const rewriteResponse = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
    rewriteResponse.headers.set("x-clinic-slug", subdomain);
    return applySecurityHeaders(rewriteResponse, req);
  }

  // If user is already on the subdomain and navigates to "/clinics/:subdomain", canonicalize to "/"
  if (subdomain && pathname === `/clinics/${subdomain}`) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return applySecurityHeaders(NextResponse.redirect(url), req);
  }

  const token =
    req.cookies.get(AUTH_COOKIE)?.value ||
    req.cookies.get("ppms_session")?.value;

  const payload = token ? await verifyToken(token) : null;

  // If user is already authenticated and visits /auth/login or /auth/register, redirect to /dashboard
  if (pathname === "/auth/login" || pathname === "/auth/register") {
    if (payload) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/dashboard", req.url)), req);
    }
    return applySecurityHeaders(
      NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      }),
      req
    );
  }

  // Dashboard routes require valid auth
  if (pathname.startsWith("/dashboard")) {
    if (!payload) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/auth/login", req.url)), req);
    }

    if (!canAccessDashboardPath(pathname, payload.role)) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/dashboard", req.url)), req);
    }
    return applySecurityHeaders(
      NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      }),
      req
    );
  }

  // Prescription print / view routes require auth (except public share route /p/:token)
  if (pathname.startsWith("/prescriptions")) {
    if (!payload) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/auth/login", req.url)), req);
    }
    return applySecurityHeaders(
      NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      }),
      req
    );
  }

  // Protected API routes
  if (pathname.startsWith("/api")) {
    const isPublicApi =
      pathname === "/api/auth/login" ||
      pathname === "/api/auth/login/2fa" ||
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
      pathname === "/api/i18n" ||
      (pathname === "/api/settings" && req.method === "GET") ||
      pathname === "/api/organizations" ||
      pathname === "/api/organizations/check-slug" ||
      pathname.startsWith("/api/public/") ||
      pathname.startsWith("/api/demo/") ||
      pathname.startsWith("/api/setup");

    if (!isPublicApi && !payload) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        ),
        req
      );
    }
    return applySecurityHeaders(
      NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      }),
      req
    );
  }

  return applySecurityHeaders(
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    }),
    req
  );
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder static files (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  determineTierForPath,
  RateLimitTier,
} from "@/lib/rate-limit";
import { fail } from "@/lib/http";
import { toErrorResponse } from "@/lib/errors";

export async function withErrorHandling(
  req: NextRequest,
  handler: () => Promise<Response>,
  customTier?: RateLimitTier
) {
  const clientIp = getClientIp(req);
  const pathname = req.nextUrl?.pathname || req.url;
  const tier = customTier || determineTierForPath(pathname, req.method);

  const ratelimit = checkRateLimit(clientIp, tier);

  const rateLimitHeaders = {
    "X-RateLimit-Limit": String(ratelimit.limit),
    "X-RateLimit-Remaining": String(ratelimit.remaining),
    "X-RateLimit-Reset": String(ratelimit.resetAt),
  };

  if (!ratelimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Too many requests. Please wait ${ratelimit.retryAfterSeconds} second${
          ratelimit.retryAfterSeconds === 1 ? "" : "s"
        } before retrying.`,
        retryAfterSeconds: ratelimit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders,
          "Retry-After": String(ratelimit.retryAfterSeconds),
        },
      }
    );
  }

  try {
    const response = await handler();

    // Attach rate limit headers to successful or handled responses
    if (response instanceof Response && response.headers) {
      try {
        response.headers.set("X-RateLimit-Limit", String(ratelimit.limit));
        response.headers.set("X-RateLimit-Remaining", String(ratelimit.remaining));
        response.headers.set("X-RateLimit-Reset", String(ratelimit.resetAt));
      } catch {
        // In case headers are immutable (e.g. frozen NextResponse), ignore
      }
    }

    return response;
  } catch (error) {
    console.error("API Error:", error);
    const parsed = toErrorResponse(error);
    const errRes = fail(parsed.message, parsed.status, (parsed as { details?: unknown }).details);
    try {
      errRes.headers.set("X-RateLimit-Limit", String(ratelimit.limit));
      errRes.headers.set("X-RateLimit-Remaining", String(ratelimit.remaining));
      errRes.headers.set("X-RateLimit-Reset", String(ratelimit.resetAt));
    } catch {
      // In case headers are immutable
    }
    return errRes;
  }
}

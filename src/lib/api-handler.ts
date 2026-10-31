import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { fail } from "@/lib/http";
import { toErrorResponse } from "@/lib/errors";

export async function withErrorHandling(
  req: NextRequest,
  handler: () => Promise<Response>,
) {
  const key = req.headers.get("x-forwarded-for") || "anon";
  const ratelimit = checkRateLimit(key);
  if (!ratelimit.allowed) {
    return fail("Rate limit exceeded", 429);
  }

  try {
    return await handler();
  } catch (error) {
    console.error("API Error:", error);
    const parsed = toErrorResponse(error);
    return fail(parsed.message, parsed.status, (parsed as { details?: unknown }).details);
  }
}

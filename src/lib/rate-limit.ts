import { NextRequest } from "next/server";

export type RateLimitTier = "auth" | "upload" | "write" | "standard";

interface TierConfig {
  windowMs: number;
  maxRequests: number;
}

const TIER_CONFIGS: Record<RateLimitTier, TierConfig> = {
  auth: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,     // 10 attempts per minute (prevents credential stuffing / brute force)
  },
  upload: {
    windowMs: 60 * 1000,
    maxRequests: 20,     // 20 uploads per minute
  },
  write: {
    windowMs: 60 * 1000,
    maxRequests: 60,     // 60 mutations per minute
  },
  standard: {
    windowMs: 60 * 1000,
    maxRequests: 120,    // 120 general requests per minute
  },
};

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const bucket = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function cleanupExpiredEntries(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS && bucket.size < 5000) {
    return;
  }
  lastCleanup = now;
  for (const [key, entry] of bucket.entries()) {
    if (entry.resetAt <= now) {
      bucket.delete(key);
    }
  }
}

export function getClientIp(req: NextRequest): string {
  // Check Cloudflare header first
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  // Check Nginx / reverse proxy Real IP
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // Parse first IP from X-Forwarded-For
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  // Fallback to anonymous client fingerprinting via user-agent or default
  const ua = req.headers.get("user-agent");
  if (ua) {
    return `ua_${ua.slice(0, 32).replace(/[^a-zA-Z0-9]/g, "")}`;
  }

  return "anonymous_client";
}

export function determineTierForPath(pathname: string, method: string): RateLimitTier {
  // Strict tier for authentication & sensitive security routes
  if (
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/api/auth/forgot-password") ||
    pathname.startsWith("/api/auth/reset-password") ||
    pathname.startsWith("/api/auth/2fa") ||
    pathname.startsWith("/api/auth/change-email") ||
    pathname.startsWith("/api/users/change-password")
  ) {
    return "auth";
  }

  // File upload tier
  if (pathname.startsWith("/api/files/upload")) {
    return "upload";
  }

  // Write operations on key transactional endpoints
  if (
    (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") &&
    (pathname.startsWith("/api/prescriptions") ||
      pathname.startsWith("/api/appointments") ||
      pathname.startsWith("/api/patients") ||
      pathname.startsWith("/api/doctors"))
  ) {
    return "write";
  }

  return "standard";
}

export function checkRateLimit(key: string, tier: RateLimitTier = "standard") {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const config = TIER_CONFIGS[tier] || TIER_CONFIGS.standard;
  const compositeKey = `${tier}:${key}`;
  const existing = bucket.get(compositeKey);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + config.windowMs;
    bucket.set(compositeKey, { count: 1, resetAt });
    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetAt: Math.ceil(resetAt / 1000),
      retryAfterSeconds: 0,
    };
  }

  if (existing.count >= config.maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      resetAt: Math.ceil(existing.resetAt / 1000),
      retryAfterSeconds,
    };
  }

  existing.count += 1;
  bucket.set(compositeKey, existing);
  return {
    allowed: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - existing.count,
    resetAt: Math.ceil(existing.resetAt / 1000),
    retryAfterSeconds: 0,
  };
}

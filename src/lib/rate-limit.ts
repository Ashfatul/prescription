const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 120;

const bucket = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string) {
  const now = Date.now();
  const existing = bucket.get(key);

  if (!existing || existing.resetAt <= now) {
    bucket.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (existing.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, retryInMs: existing.resetAt - now };
  }

  existing.count += 1;
  bucket.set(key, existing);
  return { allowed: true, remaining: MAX_REQUESTS - existing.count };
}

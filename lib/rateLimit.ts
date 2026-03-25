type RateWindow = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateWindow>();

export function getRateLimitKey(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const firstIp = fwd.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  return "unknown";
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: Math.ceil(windowMs / 1000) };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  buckets.set(key, current);
  return {
    ok: true,
    retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

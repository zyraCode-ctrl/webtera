import { Redis } from "@upstash/redis";

type RateWindow = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateWindow>();
const MAX_BUCKETS = 10_000;
const hasUpstashConfig = Boolean(
  process.env.UPSTASH_REDIS_REST_URL?.trim() &&
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
);
const redis = hasUpstashConfig ? Redis.fromEnv() : null;

export function getRateLimitKey(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const firstIp = fwd.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  return "unknown";
}

function checkRateLimitLocal(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();

  // Opportunistic cleanup to keep memory bounded in long-running processes.
  if (buckets.size > MAX_BUCKETS) {
    for (const [bucketKey, bucket] of buckets) {
      if (now >= bucket.resetAt) buckets.delete(bucketKey);
    }
  }

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

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ ok: boolean; retryAfterSec: number }> {
  if (!redis) return checkRateLimitLocal(key, limit, windowMs);

  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const redisKey = `rl:${key}:${bucket}`;
  const count = await redis.incr(redisKey);
  if (count === 1) {
    await redis.pexpire(redisKey, windowMs);
  }

  const pttl = await redis.pttl(redisKey);
  const retryAfterSec = Math.max(1, Math.ceil(Math.max(1000, pttl) / 1000));
  return { ok: count <= limit, retryAfterSec };
}

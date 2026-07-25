import type { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };

declare global {
  var __klyselzRateLimits: Map<string, Bucket> | undefined;
}

const buckets = globalThis.__klyselzRateLimits ?? new Map<string, Bucket>();
globalThis.__klyselzRateLimits = buckets;

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

export function rateLimit(
  req: NextRequest,
  options: { key: string; limit: number; windowMs: number }
) {
  const now = Date.now();
  const id = `${options.key}:${clientIp(req)}`;
  const current = buckets.get(id);
  if (!current || current.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + options.windowMs });
    return { ok: true, remaining: options.limit - 1 };
  }
  current.count += 1;
  if (current.count > options.limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  }
  return { ok: true, remaining: options.limit - current.count };
}

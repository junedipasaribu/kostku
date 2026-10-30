import { createHash } from "node:crypto";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;
const MAX_BUCKETS = 10_000;

type FailureBucket = { failures: number; resetAt: number };
const failuresByAddress = new Map<string, FailureBucket>();

function getClientAddress(request: Request) {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 128);

  const forwardedFor = request.headers.get("x-forwarded-for");
  const lastForwardedAddress = forwardedFor?.split(",").map((part) => part.trim()).filter(Boolean).at(-1);
  return lastForwardedAddress?.slice(0, 128) || "unknown";
}

function keyForAddress(address: string) {
  return createHash("sha256").update(address).digest("hex");
}

function pruneExpiredBuckets(now: number) {
  for (const [key, bucket] of failuresByAddress) {
    if (bucket.resetAt <= now) failuresByAddress.delete(key);
  }
  while (failuresByAddress.size >= MAX_BUCKETS) {
    const oldestKey = failuresByAddress.keys().next().value;
    if (!oldestKey) break;
    failuresByAddress.delete(oldestKey);
  }
}

export function checkLoginRateLimit(request: Request) {
  const key = keyForAddress(getClientAddress(request));
  const bucket = failuresByAddress.get(key);
  const now = Date.now();
  if (!bucket || bucket.resetAt <= now) {
    if (bucket) failuresByAddress.delete(key);
    return { key, blocked: false, retryAfterSeconds: 0 };
  }
  if (bucket.failures < MAX_FAILURES) return { key, blocked: false, retryAfterSeconds: 0 };
  return { key, blocked: true, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
}

export function recordFailedLogin(key: string) {
  const now = Date.now();
  let bucket = failuresByAddress.get(key);
  if (!bucket || bucket.resetAt <= now) {
    pruneExpiredBuckets(now);
    bucket = { failures: 0, resetAt: now + WINDOW_MS };
  }
  bucket.failures += 1;
  failuresByAddress.set(key, bucket);
}

export function clearLoginFailures(key: string) {
  failuresByAddress.delete(key);
}

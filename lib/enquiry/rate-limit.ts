/**
 * Rate limiting for the enquiry endpoint. Prefers Upstash (durable, shared
 * across serverless instances) when its env vars are present; otherwise falls
 * back to a per-process in-memory Map.
 *
 * NB: the in-memory fallback is PER-INSTANCE and resets on cold start — it is a
 * dev / single-instance convenience only, NOT a real distributed limiter.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

type LimitResult = { success: boolean };

const hasUpstash = () =>
  Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );

let upstash: Ratelimit | null = null;
function getUpstash(): Ratelimit {
  if (!upstash) {
    upstash = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(MAX_REQUESTS, '10 m'),
      prefix: 'enquiry',
    });
  }
  return upstash;
}

// Per-instance / dev-only fallback: sliding window of recent hit timestamps.
const memory = new Map<string, number[]>();

function memoryLimit(key: string): LimitResult {
  const now = Date.now();
  const hits = (memory.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_REQUESTS) {
    memory.set(key, hits);
    return { success: false };
  }
  hits.push(now);
  memory.set(key, hits);
  return { success: true };
}

/**
 * @param ip caller identifier (from x-forwarded-for). Returns `{ success }`.
 */
export async function checkRateLimit(ip: string): Promise<LimitResult> {
  if (hasUpstash()) {
    const { success } = await getUpstash().limit(ip);
    return { success };
  }
  return memoryLimit(ip);
}

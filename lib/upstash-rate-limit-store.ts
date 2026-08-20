/**
 * lib/upstash-rate-limit-store.ts
 *
 * Distributed RateLimiterStore backed by Upstash Redis, for use on Vercel
 * (or any serverless host where in-memory state isn't shared across
 * invocations/instances).
 *
 * Setup:
 *   1. Vercel Dashboard -> Storage -> Create Database -> Upstash -> Redis
 *      This injects KV_REST_API_URL / KV_REST_API_TOKEN into your project's
 *      env vars automatically.
 *   2. npm install @upstash/redis
 *   3. vercel env pull .env.local (to test locally)
 */

import { Redis } from "@upstash/redis";
import type { RateLimiterStore, RateLimitRecord } from "./rate-limiter";

const redisUrl = process.env.KV_REST_API_URL;
const redisToken = process.env.KV_REST_API_TOKEN;

if (!redisUrl || !redisToken) {
  console.warn(
    "⚠️  KV_REST_API_URL / KV_REST_API_TOKEN not set — Upstash rate limiter store will fail on use. " +
      "Check your Vercel project's Storage integration env var names.",
  );
}

const redis = new Redis({
  url: redisUrl ?? "",
  token: redisToken ?? "",
});

const KEY_PREFIX = "ratelimit:";

export class UpstashRateLimiterStore implements RateLimiterStore {
  async get(key: string): Promise<RateLimitRecord | undefined> {
    const value = await redis.get<RateLimitRecord>(KEY_PREFIX + key);
    return value ?? undefined;
  }

  async set(key: string, value: RateLimitRecord): Promise<void> {
    // Store with a TTL matching the reset window (in seconds), rounded up.
    // Redis auto-evicts expired rate-limit keys itself -- no manual pruning
    // needed here, unlike the in-memory store.
    const ttlSeconds = Math.max(1, Math.ceil((value.resetTime - Date.now()) / 1000));
    await redis.set(KEY_PREFIX + key, value, { ex: ttlSeconds });
  }

  async delete(key: string): Promise<void> {
    await redis.del(KEY_PREFIX + key);
  }
}

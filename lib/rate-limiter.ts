/**
 * Serverless-safe rate limiter with automatic key pruning.
 *
 * CHANGE LOG:
 * - Added periodic garbage collection to prevent memory leaks from expired keys.
 * - Added RateLimiterStore interface so implementations can be swapped for
 *   distributed stores (e.g. Upstash Redis) in serverless environments.
 * - PRUNE_INTERVAL and PRUNE_BATCH_SIZE control the GC frequency/size to keep
 *   each invocation cheap.
 */

// ---------------------------------------------------------------------------
// Abstract store interface — swap in Redis / Upstash for distributed limits
// ---------------------------------------------------------------------------

export interface RateLimiterStore {
  get(key: string): Promise<RateLimitRecord | undefined>;
  set(key: string, value: RateLimitRecord): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// ---------------------------------------------------------------------------
// In-memory implementation (single-instance / dev only)
// ---------------------------------------------------------------------------

const PRUNE_INTERVAL_MS = 60_000; // run GC every 60 s
const PRUNE_BATCH_SIZE = 500; // keys examined per GC tick

let lastPruneTime = Date.now();

/**
 * Scan a batch of keys and remove expired entries.
 * Runs at most PRUNE_BATCH_SIZE keys per invocation so it stays cheap even
 * under heavy write load.
 */
function pruneExpiredKeys(store: Map<string, RateLimitRecord>): void {
  const now = Date.now();
  if (now - lastPruneTime < PRUNE_INTERVAL_MS) return;
  lastPruneTime = now;

  let scanned = 0;
  for (const [key, record] of store) {
    if (scanned >= PRUNE_BATCH_SIZE) break;
    if (now > record.resetTime) {
      store.delete(key);
    }
    scanned++;
  }
}

class InMemoryStore implements RateLimiterStore {
  private map = new Map<string, RateLimitRecord>();

  async get(key: string): Promise<RateLimitRecord | undefined> {
    return this.map.get(key);
  }

  async set(key: string, value: RateLimitRecord): Promise<void> {
    this.map.set(key, value);
    // Trigger GC lazily on writes
    pruneExpiredKeys(this.map);
  }

  async delete(key: string): Promise<void> {
    this.map.delete(key);
  }
}

// ---------------------------------------------------------------------------
// Default store (in-memory). Swap this for an UpstashStore in prod if needed.
// ---------------------------------------------------------------------------

const defaultStore: RateLimiterStore = new InMemoryStore();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check (and increment) the rate limit for the given key.
 *
 * @param key            Unique identifier (e.g. "request-vote-link:1.2.3.4")
 * @param maxRequests    Maximum allowed requests in the window
 * @param windowMinutes  Window length in minutes
 * @param store          Optional custom store (defaults to in-memory)
 * @returns `true` if the request is allowed, `false` if rate-limited
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMinutes: number,
  store: RateLimiterStore = defaultStore
): Promise<boolean> {
  const now = Date.now();
  const record = await store.get(key);

  if (!record || now > record.resetTime) {
    await store.set(key, { count: 1, resetTime: now + windowMinutes * 60 * 1000 });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  await store.set(key, record);
  return true;
}

/**
 * Cryptographically-secure helpers using Web Crypto only.
 *
 * Note: we deliberately avoid `import { randomBytes } from "crypto"` — the Node
 * `crypto` module is not available on Cloudflare Workers (without the
 * `nodejs_compat` flag) and crashes API routes at import time with a 500 before
 * the handler even runs. `crypto.getRandomValues` works on every runtime.
 */

export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function getTokenExpiry(minutesFromNow: number): Date {
  return new Date(Date.now() + minutesFromNow * 60 * 1000);
}

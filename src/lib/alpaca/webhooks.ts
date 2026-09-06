import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getEnv } from "@/lib/config/env";

/**
 * Verifies an Alpaca webhook's HMAC-SHA256 signature against the shared
 * ALPACA_WEBHOOK_SECRET. Uses a timing-safe comparison to avoid leaking
 * information about how much of the signature matched via response timing.
 */
export function verifyAlpacaWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const env = getEnv();
  if (!env.ALPACA_WEBHOOK_SECRET || !signatureHeader) return false;

  const expected = createHmac("sha256", env.ALPACA_WEBHOOK_SECRET).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(signatureHeader, "utf8");

  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

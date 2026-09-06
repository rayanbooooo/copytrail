import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Durably records that a webhook event has been processed. Relies on the
 * unique(source, external_id) constraint on webhook_events (0002) — a
 * duplicate delivery hits a unique violation (Postgres error code 23505)
 * rather than being processed twice.
 *
 * Returns true if this call newly claimed the event (caller should process
 * it), false if it was already processed (caller should no-op).
 */
export async function claimWebhookEvent(
  admin: SupabaseClient<Database>,
  source: string,
  externalId: string,
  payload: Record<string, unknown>,
): Promise<boolean> {
  const { error } = await admin.from("webhook_events").insert({
    source,
    external_id: externalId,
    payload,
  });

  if (!error) return true;

  const isUniqueViolation = "code" in error && error.code === "23505";
  if (isUniqueViolation) return false;

  // Any other error (connection issue, schema drift) should surface loudly
  // rather than silently skipping processing of a real event.
  throw error;
}

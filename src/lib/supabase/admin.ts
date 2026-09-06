import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role client that bypasses RLS entirely. Use ONLY from trusted
 * server code that has already established its own authorization
 * (webhook signature verification, an authenticated server action that has
 * checked auth.uid() itself, or a cron job gated by CRON_SECRET) — never
 * expose this client, or anything built on it, to a code path reachable
 * directly from client input without such a check.
 */
export function createAdminSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

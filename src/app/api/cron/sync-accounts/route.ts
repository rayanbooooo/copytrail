import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getAccountSnapshot } from "@/lib/alpaca/accounts";
import { getEnv, isAlpacaConfigured } from "@/lib/config/env";

/**
 * Periodic sync of wallets.{cash_balance,portfolio_value} from each user's
 * live Alpaca account. The copy-engine's sizing formula depends on fresh
 * leader equity (lib/copy-engine/sizing.ts) — this keeps that number from
 * going stale between webhook events. Intended to run on a schedule (e.g.
 * Vercel Cron) with the shared CRON_SECRET passed as a bearer token.
 *
 * Note: this OVERWRITES cash_balance with Alpaca's authoritative figure,
 * which intentionally does not know about accumulated $1 platform fees —
 * see the wallet fee-drift caveat in the README. A production version of
 * this sync should reconcile that drift rather than silently erasing it;
 * out of scope for this build.
 */
export async function POST(request: Request) {
  const env = getEnv();
  const authHeader = request.headers.get("authorization");
  if (!env.CRON_SECRET || authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAlpacaConfigured()) {
    return NextResponse.json({ synced: 0, skipped: "alpaca_not_configured" });
  }

  const admin = createAdminSupabaseClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, alpaca_account_id")
    .not("alpaca_account_id", "is", null);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ synced: 0 });
  }

  const results = await Promise.allSettled(
    profiles.map(async (profile) => {
      const snapshot = await getAccountSnapshot(profile.alpaca_account_id!);
      await admin
        .from("wallets")
        .update({
          cash_balance: Number(snapshot.cash),
          portfolio_value: Number(snapshot.portfolio_value),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", profile.id);
    }),
  );

  const synced = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - synced;

  return NextResponse.json({ synced, failed });
}

import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { verifyAlpacaWebhookSignature } from "@/lib/alpaca/webhooks";
import { claimWebhookEvent } from "@/lib/copy-engine/idempotency";
import { fanOutCopyTrades } from "@/lib/copy-engine/executor";
import type { AlpacaTradeUpdateEvent } from "@/lib/alpaca/types";

/**
 * Alpaca trade-update webhook: the single entry point that turns a leader's
 * fill into copy-trades for their followers.
 *
 * Flow: verify signature -> idempotency claim -> resolve which local profile
 * owns the Alpaca account -> reconcile the trade's execution price -> if the
 * account belongs to a leader, fan out proportional copy orders.
 *
 * Always returns 200 for any event we've successfully claimed (even ones we
 * decide not to act on), per webhook convention — a non-2xx response tells
 * Alpaca to retry, which we only want for genuine processing failures.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-alpaca-signature");

  if (!verifyAlpacaWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as AlpacaTradeUpdateEvent;
  const admin = createAdminSupabaseClient();

  const claimed = await claimWebhookEvent(admin, "alpaca", event.event_id, event as unknown as Record<string, unknown>);
  if (!claimed) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  if (event.event !== "fill" && event.event !== "partial_fill") {
    return NextResponse.json({ ok: true, ignored: event.event });
  }

  const { data: ownerProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("alpaca_account_id", event.account_id)
    .maybeSingle();

  if (!ownerProfile) {
    return NextResponse.json({ ok: true, ignored: "unknown_account" });
  }

  const executionPrice = Number(event.price ?? event.order.filled_avg_price ?? 0);
  const executedAt = event.timestamp ?? new Date().toISOString();

  const { data: reconciled } = await admin.rpc("reconcile_trade_execution", {
    p_alpaca_order_id: event.order.id,
    p_execution_price: executionPrice,
    p_executed_at: executedAt,
  });

  if (!reconciled) {
    // Fill for an order we never logged (e.g. placed outside this app).
    // We intentionally do not fabricate a trades row for it — only orders
    // this platform originated (self-directed or copy) carry our fee/audit
    // invariants — but we still check below whether it should trigger a
    // copy fan-out for this account's followers if it IS a leader account.
    return NextResponse.json({ ok: true, ignored: "untracked_order" });
  }

  const { data: leader } = await admin
    .from("leaders")
    .select("id, profile_id")
    .eq("profile_id", ownerProfile.id)
    .maybeSingle();

  if (!leader || reconciled.source !== "self") {
    return NextResponse.json({ ok: true, isLeader: false });
  }

  const fanOutResults = await fanOutCopyTrades(admin, reconciled, leader.profile_id);

  return NextResponse.json({ ok: true, isLeader: true, fanOutResults });
}

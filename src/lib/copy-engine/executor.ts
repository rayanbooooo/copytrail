import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TradeRow } from "@/types/database";
import { getAccountSnapshot } from "@/lib/alpaca/accounts";
import { submitOrder } from "@/lib/alpaca/orders";
import { computeProportionalCopyNotional, MIN_COPY_NOTIONAL } from "@/lib/copy-engine/sizing";

type Client = SupabaseClient<Database>;

export interface FanOutResult {
  followerId: string;
  status: "submitted" | "skipped" | "failed";
  reason?: string;
  alpacaOrderId?: string;
}

/**
 * Given a leader's confirmed fill, fans out proportionally-sized copy
 * orders to every active follower. Each follower is isolated via
 * Promise.allSettled so one follower's failure (insufficient buying power,
 * unapproved KYC, a rejected order) never blocks the others.
 *
 * No durable retry queue in v1 (see plan risk #4) — a failed fan-out entry
 * is recorded in the triggering webhook_events row for later inspection,
 * not automatically retried. Acceptable for the current single-app scope;
 * a queue (Inngest/Trigger.dev) is the documented future fix at volume.
 */
export async function fanOutCopyTrades(
  admin: Client,
  sourceTrade: TradeRow,
  leaderProfileId: string,
): Promise<FanOutResult[]> {
  const { data: leaderProfile } = await admin
    .from("profiles")
    .select("alpaca_account_id")
    .eq("id", leaderProfileId)
    .maybeSingle();

  if (!leaderProfile?.alpaca_account_id) return [];

  const { data: leader } = await admin
    .from("leaders")
    .select("id")
    .eq("profile_id", leaderProfileId)
    .maybeSingle();

  if (!leader) return [];

  const { data: follows } = await admin
    .from("follows")
    .select("follower_id, allocation_amount")
    .eq("leader_id", leader.id)
    .eq("status", "active");

  if (!follows || follows.length === 0) return [];

  const leaderTradeNotional =
    Number(sourceTrade.execution_price ?? 0) * Number(sourceTrade.qty ?? 0);

  let leaderEquity = 0;
  try {
    const snapshot = await getAccountSnapshot(leaderProfile.alpaca_account_id);
    leaderEquity = Number(snapshot.equity);
  } catch {
    return follows.map((f) => ({
      followerId: f.follower_id,
      status: "failed" as const,
      reason: "Could not read leader account equity",
    }));
  }

  const results = await Promise.allSettled(
    follows.map((follow) =>
      copyForFollower(admin, follow, sourceTrade, leaderTradeNotional, leaderEquity),
    ),
  );

  return results.map((result, i) =>
    result.status === "fulfilled"
      ? result.value
      : {
          followerId: follows[i]!.follower_id,
          status: "failed" as const,
          reason: result.reason instanceof Error ? result.reason.message : String(result.reason),
        },
  );
}

async function copyForFollower(
  admin: Client,
  follow: { follower_id: string; allocation_amount: number },
  sourceTrade: TradeRow,
  leaderTradeNotional: number,
  leaderEquity: number,
): Promise<FanOutResult> {
  const { data: followerProfile } = await admin
    .from("profiles")
    .select("alpaca_account_id, kyc_status")
    .eq("id", follow.follower_id)
    .maybeSingle();

  if (!followerProfile?.alpaca_account_id || followerProfile.kyc_status !== "approved") {
    return { followerId: follow.follower_id, status: "skipped", reason: "Not onboarded" };
  }

  let followerBuyingPower = 0;
  try {
    const snapshot = await getAccountSnapshot(followerProfile.alpaca_account_id);
    followerBuyingPower = Number(snapshot.buying_power);
  } catch {
    return { followerId: follow.follower_id, status: "failed", reason: "Could not read buying power" };
  }

  const notional = computeProportionalCopyNotional({
    followerAllocation: follow.allocation_amount,
    leaderTradeNotional,
    leaderEquity,
    followerBuyingPower,
  });

  if (notional < MIN_COPY_NOTIONAL) {
    return { followerId: follow.follower_id, status: "skipped", reason: "Below minimum notional" };
  }

  try {
    const order = await submitOrder(followerProfile.alpaca_account_id, {
      symbol: sourceTrade.symbol,
      side: sourceTrade.side,
      type: "market",
      time_in_force: "day",
      notional: notional.toFixed(2),
    });

    const { error: rpcError } = await admin.rpc("record_copy_trade", {
      p_user_id: follow.follower_id,
      p_alpaca_order_id: order.id,
      p_symbol: sourceTrade.symbol,
      p_qty: Number(order.qty ?? notional),
      p_side: sourceTrade.side,
      p_order_type: "market",
      p_source_trade_id: sourceTrade.id,
    });

    if (rpcError) {
      return {
        followerId: follow.follower_id,
        status: "failed",
        reason: `Order placed (${order.id}) but failed to log: ${rpcError.message}`,
      };
    }

    return { followerId: follow.follower_id, status: "submitted", alpacaOrderId: order.id };
  } catch (err) {
    return {
      followerId: follow.follower_id,
      status: "failed",
      reason: err instanceof Error ? err.message : "Order submission failed",
    };
  }
}

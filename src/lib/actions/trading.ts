"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { submitOrder } from "@/lib/alpaca/orders";
import { isAlpacaConfigured } from "@/lib/config/env";
import { orderSchema } from "@/lib/validation/schemas";

export interface TradeActionState {
  error?: string;
  success?: boolean;
}

const SELF_DIRECTED_PLATFORM_FEE = 1.0;

/**
 * Submits a self-directed market/limit order for the signed-in user.
 *
 * Fee handling: the $1 platform commission is recorded AND collected (a
 * wallet debit) atomically with the trade log via the record_self_directed_trade
 * RPC (see 0007_trade_rpc_functions.sql) — never one without the other. This
 * only ever touches trades/wallets through the service-role client because
 * those tables have no client write RLS policy (0003_rls_policies.sql).
 */
export async function submitSelfDirectedOrder(
  _prevState: TradeActionState,
  formData: FormData,
): Promise<TradeActionState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to trade." };

  if (!isAlpacaConfigured()) {
    return { error: "Alpaca isn't connected yet — trading is disabled until API keys are added." };
  }

  const parsed = orderSchema.safeParse({
    symbol: formData.get("symbol"),
    side: formData.get("side"),
    orderType: formData.get("orderType") ?? "market",
    notionalAmount: formData.get("notionalAmount") || undefined,
    qty: formData.get("qty") || undefined,
    limitPrice: formData.get("limitPrice") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid order." };
  }

  const admin = createAdminSupabaseClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("alpaca_account_id, kyc_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.alpaca_account_id || profile.kyc_status !== "approved") {
    return { error: "Complete brokerage onboarding and KYC approval before trading." };
  }

  const { data: wallet } = await admin
    .from("wallets")
    .select("cash_balance")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!wallet || wallet.cash_balance < SELF_DIRECTED_PLATFORM_FEE) {
    return { error: "Insufficient cash balance to cover the $1 platform fee." };
  }

  const isLimit = parsed.data.orderType === "limit";

  let alpacaOrderId: string;
  let filledQty: number;

  try {
    const order = await submitOrder(profile.alpaca_account_id, {
      symbol: parsed.data.symbol,
      side: parsed.data.side,
      type: parsed.data.orderType,
      time_in_force: "day",
      // Market orders are dollar-denominated (Alpaca "notional"); limit
      // orders must be share-denominated ("qty") — Alpaca rejects a limit
      // order submitted with notional instead of qty.
      notional: isLimit ? undefined : parsed.data.notionalAmount!.toFixed(2),
      qty: isLimit ? parsed.data.qty!.toString() : undefined,
      limit_price: isLimit ? parsed.data.limitPrice!.toFixed(2) : undefined,
    });
    alpacaOrderId = order.id;
    // Limit orders: qty is exactly what we submitted, no ambiguity. Market
    // (notional) orders: Alpaca doesn't confirm share qty until the fill
    // webhook arrives, so this is a placeholder until reconciled.
    filledQty = isLimit
      ? parsed.data.qty!
      : Number(order.qty ?? order.filled_qty ?? 0) || parsed.data.notionalAmount!;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Order submission failed." };
  }

  const { error: rpcError } = await admin.rpc("record_self_directed_trade", {
    p_user_id: user.id,
    p_alpaca_order_id: alpacaOrderId,
    p_symbol: parsed.data.symbol,
    p_qty: filledQty,
    p_side: parsed.data.side,
    p_order_type: parsed.data.orderType,
    p_platform_fee: SELF_DIRECTED_PLATFORM_FEE,
  });

  if (rpcError) {
    // The order already reached Alpaca at this point; surface the logging
    // failure distinctly so it can be reconciled rather than resubmitted.
    return {
      error: `Order was submitted to Alpaca (${alpacaOrderId}) but failed to log locally: ${rpcError.message}`,
    };
  }

  revalidatePath(`/trade/${parsed.data.symbol}`);
  revalidatePath("/account");
  revalidatePath("/home");
  return { success: true };
}

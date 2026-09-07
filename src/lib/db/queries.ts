import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { LeaderCardData } from "@/types/domain";

type Client = SupabaseClient<Database>;

export async function getLeaderboard(supabase: Client): Promise<LeaderCardData[]> {
  const [{ data: leaders, error: leadersError }, { data: counts }] = await Promise.all([
    supabase
      .from("leaders")
      .select("*, profiles!leaders_profile_id_fkey(email)")
      .order("total_return_30d", { ascending: false }),
    supabase.from("leader_copier_counts").select("*"),
  ]);

  if (leadersError || !leaders) return [];

  const countByLeader = new Map((counts ?? []).map((c) => [c.leader_id, c.active_copier_count]));

  return leaders.map((leader) => {
    const profile = (leader as unknown as { profiles: { email: string } | null }).profiles;
    return {
      ...leader,
      displayName: profile?.email?.split("@")[0] ?? "Trader",
      copierCount: countByLeader.get(leader.id) ?? 0,
    };
  });
}

export async function getAggregateCopyPoolReturn(supabase: Client): Promise<number> {
  const { data } = await supabase.from("leaders").select("total_return_30d");
  if (!data || data.length === 0) return 0;
  const sum = data.reduce((acc, row) => acc + Number(row.total_return_30d), 0);
  return sum / data.length;
}

export async function getFollowForUser(supabase: Client, followerId: string, leaderId: string) {
  const { data } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", followerId)
    .eq("leader_id", leaderId)
    .maybeSingle();
  return data;
}

export interface ActiveFollowingRow {
  id: string;
  allocation_amount: number;
  leaderDisplayName: string;
}

export async function getActiveFollowing(
  supabase: Client,
  followerId: string,
): Promise<ActiveFollowingRow | null> {
  const { data } = await supabase
    .from("follows")
    .select("id, allocation_amount, leaders(profiles!leaders_profile_id_fkey(email))")
    .eq("follower_id", followerId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  const leader = data.leaders as unknown as { profiles: { email: string } | null } | null;
  const email = leader?.profiles?.email ?? "Trader";

  return {
    id: data.id,
    allocation_amount: data.allocation_amount,
    leaderDisplayName: email.split("@")[0] ?? "Trader",
  };
}

export async function getWallet(supabase: Client, userId: string) {
  const { data } = await supabase.from("wallets").select("*").eq("user_id", userId).maybeSingle();
  return data;
}

export async function getProfile(supabase: Client, userId: string) {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data;
}

export async function getRecentTrades(supabase: Client, userId: string, limit = 20) {
  const { data } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", userId)
    .order("executed_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getSubscription(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function getWatchlist(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("watchlist_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export interface HoldingSummary {
  symbol: string;
  qty: number;
}

/**
 * Derives current per-symbol holdings from the trades ledger (sum of buys
 * minus sells). This app doesn't maintain a separate "positions" table —
 * trades are the single source of truth, so holdings are always computed,
 * never independently stored and liable to drift.
 */
export async function getHoldings(supabase: Client, userId: string): Promise<HoldingSummary[]> {
  const { data } = await supabase
    .from("trades")
    .select("symbol, qty, side")
    .eq("user_id", userId);

  if (!data) return [];

  const bySymbol = new Map<string, number>();
  for (const trade of data) {
    const delta = trade.side === "buy" ? Number(trade.qty) : -Number(trade.qty);
    bySymbol.set(trade.symbol, (bySymbol.get(trade.symbol) ?? 0) + delta);
  }

  return Array.from(bySymbol.entries())
    .filter(([, qty]) => qty > 0.000001)
    .map(([symbol, qty]) => ({ symbol, qty }));
}

export async function getWalletSnapshots(supabase: Client, userId: string, days = 30) {
  const { data } = await supabase
    .from("wallet_snapshots")
    .select("*")
    .eq("user_id", userId)
    .order("snapshot_date", { ascending: true })
    .limit(days);
  return data ?? [];
}

export async function getTradesForSymbol(supabase: Client, userId: string, symbol: string, limit = 10) {
  const { data } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", userId)
    .eq("symbol", symbol)
    .order("executed_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getLeaderById(supabase: Client, leaderId: string) {
  const { data } = await supabase
    .from("leaders")
    .select("*, profiles!leaders_profile_id_fkey(email)")
    .eq("id", leaderId)
    .maybeSingle();
  if (!data) return null;
  const profile = (data as unknown as { profiles: { email: string } | null }).profiles;
  return {
    ...data,
    displayName: profile?.email?.split("@")[0] ?? "Trader",
  };
}

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getWallet } from "@/lib/db/queries";
import { getSymbolMeta } from "@/lib/data/symbols";
import { AssetHeader } from "@/components/terminal/AssetHeader";
import { TerminalBody } from "@/components/terminal/TerminalBody";

export default async function TradeTerminalPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const meta = getSymbolMeta(symbol);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [wallet, watchlistRow] = await Promise.all([
    user ? getWallet(supabase, user.id) : Promise.resolve(null),
    user
      ? supabase
          .from("watchlist_items")
          .select("id")
          .eq("user_id", user.id)
          .eq("symbol", meta.symbol)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="space-y-5">
      <AssetHeader meta={meta} initiallyWatched={Boolean(watchlistRow.data)} />
      <TerminalBody meta={meta} buyingPower={wallet?.cash_balance ?? 0} />
    </div>
  );
}

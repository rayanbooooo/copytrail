import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getWallet } from "@/lib/db/queries";
import { MarketHeader } from "@/components/terminal/MarketHeader";
import { TerminalBody } from "@/components/terminal/TerminalBody";

export default async function TradeTerminalPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const wallet = user ? await getWallet(supabase, user.id) : null;

  return (
    <div className="space-y-5">
      <MarketHeader symbol={upperSymbol} />
      <TerminalBody symbol={upperSymbol} buyingPower={wallet?.cash_balance ?? 0} />
    </div>
  );
}

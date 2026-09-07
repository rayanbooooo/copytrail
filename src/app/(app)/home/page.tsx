import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getHoldings, getWallet, getWalletSnapshots } from "@/lib/db/queries";
import { PortfolioHeroCard } from "@/components/home/PortfolioHeroCard";
import { QuickActions } from "@/components/home/QuickActions";
import { HoldingsList } from "@/components/home/HoldingsList";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [wallet, snapshots, holdings] = await Promise.all([
    getWallet(supabase, user.id),
    getWalletSnapshots(supabase, user.id, 90),
    getHoldings(supabase, user.id),
  ]);

  const firstName = user.email?.split("@")[0] ?? "there";

  return (
    <div className="space-y-6">
      <p className="text-[13px] text-ink-muted lg:text-[15px]">
        {greeting()}, <span className="font-medium text-ink capitalize">{firstName}</span>
      </p>

      <div className="lg:grid lg:grid-cols-[1.4fr_1fr] lg:gap-6 lg:space-y-0">
        <div className="space-y-6">
          <PortfolioHeroCard
            snapshots={snapshots}
            cashBalance={wallet?.cash_balance ?? 0}
            portfolioValue={wallet?.portfolio_value ?? 0}
          />
          <QuickActions />
        </div>

        <div className="mt-6 lg:mt-0">
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-faint">
            Your portfolio
          </h2>
          <HoldingsList holdings={holdings} />
        </div>
      </div>
    </div>
  );
}

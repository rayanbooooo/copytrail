import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getHoldings, getRecentTrades, getWallet, getWalletSnapshots } from "@/lib/db/queries";
import { PortfolioHeroCard } from "@/components/home/PortfolioHeroCard";
import { QuickActions } from "@/components/home/QuickActions";
import { HoldingsList } from "@/components/home/HoldingsList";
import { RecentActivity } from "@/components/home/RecentActivity";
import { NotificationsButton } from "@/components/home/NotificationsButton";

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

  const [wallet, snapshots, holdings, trades] = await Promise.all([
    getWallet(supabase, user.id),
    getWalletSnapshots(supabase, user.id, 400),
    getHoldings(supabase, user.id),
    getRecentTrades(supabase, user.id, 10),
  ]);

  const firstName = user.email?.split("@")[0] ?? "there";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[19px] font-semibold tracking-tight text-ink lg:text-[22px]">
          {greeting()}, <span className="capitalize">{firstName}</span>
        </p>
        <NotificationsButton trades={trades} />
      </div>

      <div className="lg:grid lg:grid-cols-[1.4fr_1fr] lg:gap-6 lg:space-y-0">
        <div className="space-y-6">
          <PortfolioHeroCard
            snapshots={snapshots}
            cashBalance={wallet?.cash_balance ?? 0}
            portfolioValue={wallet?.portfolio_value ?? 0}
          />
          <QuickActions />

          <div className="hidden lg:block">
            <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-faint">
              Recent activity
            </h2>
            <RecentActivity trades={trades} />
          </div>
        </div>

        <div className="mt-6 space-y-6 lg:mt-0">
          <div>
            <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-faint">
              Your portfolio
            </h2>
            <HoldingsList holdings={holdings} />
          </div>

          <div className="lg:hidden">
            <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-faint">
              Recent activity
            </h2>
            <RecentActivity trades={trades} />
          </div>
        </div>
      </div>
    </div>
  );
}

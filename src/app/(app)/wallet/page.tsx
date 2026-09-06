import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getActiveFollowing, getSubscription, getWallet } from "@/lib/db/queries";
import { listAchRelationships } from "@/lib/alpaca/funding";
import { isAlpacaConfigured, isPlaidConfigured, isStripeConfigured } from "@/lib/config/env";
import { PortfolioBalanceCard } from "@/components/wallet/PortfolioBalanceCard";
import { CopyEngineStatusBox } from "@/components/wallet/CopyEngineStatusBox";
import { LinkedBanksModule } from "@/components/wallet/LinkedBanksModule";
import { SubscriptionCard } from "@/components/wallet/SubscriptionCard";
import type { AlpacaAchRelationship } from "@/lib/alpaca/types";

export default async function WalletPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminSupabaseClient();
  const [wallet, following, subscription, profile] = await Promise.all([
    getWallet(supabase, user.id),
    getActiveFollowing(supabase, user.id),
    getSubscription(supabase, user.id),
    admin.from("profiles").select("alpaca_account_id").eq("id", user.id).maybeSingle(),
  ]);

  let relationships: AlpacaAchRelationship[] = [];
  const bankLinkConfigured = isAlpacaConfigured() && isPlaidConfigured();
  if (bankLinkConfigured && profile.data?.alpaca_account_id) {
    relationships = await listAchRelationships(profile.data.alpaca_account_id).catch(() => []);
  }

  return (
    <div className="space-y-5">
      <PortfolioBalanceCard
        cashBalance={wallet?.cash_balance ?? 0}
        portfolioValue={wallet?.portfolio_value ?? 0}
      />

      <CopyEngineStatusBox
        following={
          following
            ? { leaderName: following.leaderDisplayName, allocationAmount: following.allocation_amount }
            : null
        }
        nextBillingDate={subscription?.next_billing_date ?? null}
      />

      <SubscriptionCard
        status={subscription?.status ?? null}
        nextBillingDate={subscription?.next_billing_date ?? null}
        configured={isStripeConfigured()}
      />

      <div>
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-faint">
          Linked accounts
        </h2>
        <LinkedBanksModule relationships={relationships} configured={bankLinkConfigured} />
      </div>
    </div>
  );
}

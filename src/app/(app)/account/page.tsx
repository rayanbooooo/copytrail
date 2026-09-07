import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getActiveFollowing, getProfile, getSubscription, getWallet } from "@/lib/db/queries";
import { listAchRelationships } from "@/lib/alpaca/funding";
import { isAlpacaConfigured, isPlaidConfigured, isStripeConfigured } from "@/lib/config/env";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Pill";
import { AccountMenu } from "@/components/account/AccountMenu";
import { PortfolioBalanceCard } from "@/components/wallet/PortfolioBalanceCard";
import { CopyEngineStatusBox } from "@/components/wallet/CopyEngineStatusBox";
import { SubscriptionCard } from "@/components/wallet/SubscriptionCard";
import { LinkedBanksModule } from "@/components/wallet/LinkedBanksModule";
import type { AlpacaAchRelationship } from "@/lib/alpaca/types";

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [profile, wallet, following, subscription] = await Promise.all([
    getProfile(supabase, user.id),
    getWallet(supabase, user.id),
    getActiveFollowing(supabase, user.id),
    getSubscription(supabase, user.id),
  ]);

  const bankLinkConfigured = isAlpacaConfigured() && isPlaidConfigured();
  let relationships: AlpacaAchRelationship[] = [];
  if (bankLinkConfigured && profile?.alpaca_account_id) {
    relationships = await listAchRelationships(profile.alpaca_account_id).catch(() => []);
  }

  return (
    <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Avatar name={user.email ?? "You"} size={52} />
          <div>
            <p className="text-[15px] font-semibold text-ink">{user.email}</p>
            <Pill tone="neutral">Verified account</Pill>
          </div>
        </div>

        <AccountMenu kycStatus={profile?.kyc_status ?? "pending"} />

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
      </div>

      <div className="space-y-6">
        <PortfolioBalanceCard
          cashBalance={wallet?.cash_balance ?? 0}
          portfolioValue={wallet?.portfolio_value ?? 0}
        />

        <div>
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-faint">
            Linked accounts
          </h2>
          <LinkedBanksModule relationships={relationships} configured={bankLinkConfigured} />
        </div>
      </div>
    </div>
  );
}

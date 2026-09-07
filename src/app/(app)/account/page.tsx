import { CheckCircle2 } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveFollowing, getProfile, getSubscription, getWallet } from "@/lib/db/queries";
import { listAchRelationships } from "@/lib/alpaca/funding";
import { isAlpacaConfigured, isPlaidConfigured, isStripeConfigured } from "@/lib/config/env";
import { Avatar } from "@/components/ui/Avatar";
import { AccountMenu } from "@/components/account/AccountMenu";
import { PortfolioBalanceCard } from "@/components/wallet/PortfolioBalanceCard";
import { CopyEngineStatusBox } from "@/components/wallet/CopyEngineStatusBox";
import { SubscriptionCard } from "@/components/wallet/SubscriptionCard";
import { LinkedBanksModule } from "@/components/wallet/LinkedBanksModule";
import { Reveal } from "@/components/shell/Reveal";
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

  const verified = profile?.kyc_status === "approved";

  return (
    <div className="space-y-6">
      <h1 className="text-[19px] font-semibold tracking-tight text-ink">Account</h1>

      <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <div className="space-y-6">
          <Reveal className="flex items-center gap-3">
            <Avatar name={user.email ?? "You"} size={56} />
            <div>
              <p className="text-[15px] font-semibold text-ink">{user.email}</p>
              {verified ? (
                <p className="mt-0.5 flex items-center gap-1 text-[12.5px] font-medium text-emerald-signal">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified account
                </p>
              ) : (
                <p className="mt-0.5 text-[12.5px] font-medium text-amber-400">Verification pending</p>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <AccountMenu kycStatus={profile?.kyc_status ?? "pending"} />
          </Reveal>

          <Reveal delay={0.1}>
            <CopyEngineStatusBox
              following={
                following
                  ? { leaderName: following.leaderDisplayName, allocationAmount: following.allocation_amount }
                  : null
              }
              nextBillingDate={subscription?.next_billing_date ?? null}
            />
          </Reveal>

          <Reveal delay={0.15}>
            <SubscriptionCard
              status={subscription?.status ?? null}
              nextBillingDate={subscription?.next_billing_date ?? null}
              configured={isStripeConfigured()}
            />
          </Reveal>
        </div>

        <div className="mt-6 space-y-6 lg:mt-0">
          <Reveal delay={0.05}>
            <PortfolioBalanceCard
              cashBalance={wallet?.cash_balance ?? 0}
              portfolioValue={wallet?.portfolio_value ?? 0}
            />
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-faint">
              Linked accounts
            </h2>
            <LinkedBanksModule relationships={relationships} configured={bankLinkConfigured} />
          </Reveal>
        </div>
      </div>
    </div>
  );
}

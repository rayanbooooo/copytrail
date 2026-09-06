import { isAlpacaConfigured, isPlaidConfigured } from "@/lib/config/env";
import { ConfigMissingBanner } from "@/components/ui/ConfigMissingBanner";
import { FundingForm } from "@/components/wallet/FundingForm";

export default function FundOnboardingPage() {
  const ready = isAlpacaConfigured() && isPlaidConfigured();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">Fund your account</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Link a bank account with Plaid to move cash into your brokerage account via ACH.
        </p>
      </div>

      {!ready && (
        <ConfigMissingBanner
          service="Plaid + Alpaca funding"
          detail="Add PLAID_CLIENT_ID/PLAID_SECRET and Alpaca credentials to enable bank linking."
        />
      )}

      <FundingForm disabled={!ready} />
    </div>
  );
}

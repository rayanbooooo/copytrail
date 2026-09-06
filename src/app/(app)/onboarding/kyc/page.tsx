import { isAlpacaConfigured } from "@/lib/config/env";
import { ConfigMissingBanner } from "@/components/ui/ConfigMissingBanner";
import { KycForm } from "@/components/wallet/KycForm";

export default function KycOnboardingPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">Verify your identity</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Alpaca Securities LLC uses this information to open your brokerage account. This is a
          simplified placeholder form — Alpaca&apos;s real KYC flow includes additional
          disclosures and documents once live credentials are connected.
        </p>
      </div>

      {!isAlpacaConfigured() && (
        <ConfigMissingBanner
          service="Alpaca Broker API"
          detail="Add ALPACA_BROKER_API_KEY_ID and ALPACA_BROKER_API_SECRET to enable account creation."
        />
      )}

      <KycForm disabled={!isAlpacaConfigured()} />
    </div>
  );
}

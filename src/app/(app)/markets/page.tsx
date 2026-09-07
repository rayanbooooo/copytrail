import { isAlpacaMarketDataConfigured } from "@/lib/config/env";
import { MarketsList } from "@/components/markets/MarketsList";

export default function MarketsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-[19px] font-semibold tracking-tight text-ink">Markets</h1>
      <MarketsList marketDataConfigured={isAlpacaMarketDataConfigured()} />
    </div>
  );
}

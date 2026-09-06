"use client";

import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatPercent } from "@/lib/utils/formatting";
import { Pill } from "@/components/ui/Pill";
import { useRealtimePrice } from "@/hooks/useRealtimePrice";

export function MarketHeader({ symbol }: { symbol: string }) {
  const { quote, configured, loading } = useRealtimePrice(symbol);
  const positive = (quote?.changeAbsolute ?? 0) >= 0;

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{symbol}</h1>
          <Pill tone="neutral">{quote?.assetClass === "forex" ? "Forex" : "Equity"}</Pill>
        </div>
        {loading ? (
          <div className="mt-1.5 h-6 w-32 animate-pulse rounded bg-white/[0.06]" />
        ) : quote ? (
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-[22px] font-semibold tracking-tight text-ink">
              {formatCurrency(quote.price)}
            </span>
            <span
              className={cn(
                "font-mono text-[13px] font-medium",
                positive ? "text-emerald-signal" : "text-rose-signal",
              )}
            >
              {formatPercent(quote.changePercent, { signed: true })}
            </span>
          </div>
        ) : !configured ? (
          <p className="mt-1 text-[13px] text-ink-faint">Live pricing not connected</p>
        ) : (
          <p className="mt-1 text-[13px] text-ink-faint">No quote available</p>
        )}
      </div>
    </div>
  );
}

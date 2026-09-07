"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatPercent } from "@/lib/utils/formatting";
import { Stat } from "@/components/ui/Stat";
import { useRealtimePrice } from "@/hooks/useRealtimePrice";
import { toggleWatchlist } from "@/lib/actions/watchlist";
import type { SymbolMeta } from "@/lib/data/symbols";
import type { Bar } from "@/lib/alpaca/marketDataStream";

export function AssetHeader({ meta, initiallyWatched }: { meta: SymbolMeta; initiallyWatched: boolean }) {
  const router = useRouter();
  const { quote, configured, loading } = useRealtimePrice(meta.symbol);
  const [watched, setWatched] = useState(initiallyWatched);
  const [pending, startTransition] = useTransition();
  const [bar, setBar] = useState<Bar | null>(null);
  const positive = (quote?.changeAbsolute ?? 0) >= 0;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/market/bars?symbol=${meta.symbol}&timeframe=1M`)
      .then((r) => r.json())
      .then((body) => {
        if (cancelled) return;
        const bars = body.bars as Bar[] | undefined;
        if (bars && bars.length > 0) setBar(bars[bars.length - 1]!);
      });
    return () => {
      cancelled = true;
    };
  }, [meta.symbol]);

  return (
    <div className="-mx-4 border-b border-hairline px-4 pb-3 lg:mx-0 lg:rounded-lg lg:border lg:px-4 lg:py-3">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="text-ink-muted lg:hidden" aria-label="Back">
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-baseline gap-2">
          <h1 className="text-[15px] font-semibold tracking-tight text-ink">{meta.symbol}</h1>
          <span className="text-[11px] uppercase tracking-wide text-ink-faint">
            {meta.assetClass === "forex" ? "Forex" : "Equity"}
          </span>
        </div>

        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await toggleWatchlist(meta.symbol);
              if (typeof result.watching === "boolean") setWatched(result.watching);
            })
          }
          aria-label="Toggle watchlist"
          className="text-ink-muted active:scale-90 transition-transform"
        >
          <Star className={cn("h-4 w-4", watched && "fill-emerald-signal text-emerald-signal")} />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          {loading ? (
            <div className="h-7 w-28 animate-pulse rounded bg-white/[0.06]" />
          ) : quote ? (
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[24px] font-semibold tracking-tight tabular-nums text-ink">
                {formatCurrency(quote.price)}
              </span>
              <span className={cn("font-mono text-[12px] font-medium tabular-nums", positive ? "text-emerald-signal" : "text-rose-signal")}>
                {formatPercent(quote.changePercent, { signed: true })}
              </span>
            </div>
          ) : !configured ? (
            <p className="text-[12px] text-ink-faint">Live pricing not connected</p>
          ) : (
            <p className="text-[12px] text-ink-faint">No quote available</p>
          )}
        </div>

        {bar && (
          <div className="flex gap-5">
            <Stat label="Open" value={formatCurrency(bar.open)} />
            <Stat label="High" value={formatCurrency(bar.high)} />
            <Stat label="Low" value={formatCurrency(bar.low)} />
            <Stat label="Vol" value={new Intl.NumberFormat("en-US", { notation: "compact" }).format(bar.volume)} />
          </div>
        )}
      </div>
    </div>
  );
}

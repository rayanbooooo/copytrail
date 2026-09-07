"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronLeft, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatPercent } from "@/lib/utils/formatting";
import { Pill } from "@/components/ui/Pill";
import { useRealtimePrice } from "@/hooks/useRealtimePrice";
import { toggleWatchlist } from "@/lib/actions/watchlist";
import type { SymbolMeta } from "@/lib/data/symbols";

export function AssetHeader({ meta, initiallyWatched }: { meta: SymbolMeta; initiallyWatched: boolean }) {
  const router = useRouter();
  const { quote, configured, loading } = useRealtimePrice(meta.symbol);
  const [watched, setWatched] = useState(initiallyWatched);
  const [pending, startTransition] = useTransition();
  const positive = (quote?.changeAbsolute ?? 0) >= 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="text-ink-muted" aria-label="Back">
          <ChevronLeft className="h-6 w-6" />
        </button>
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
          <Star className={cn("h-5 w-5", watched && "fill-emerald-signal text-emerald-signal")} />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{meta.symbol}</h1>
        <Pill tone="neutral">{meta.assetClass === "forex" ? "Forex" : "Equity"}</Pill>
      </div>
      <p className="text-[13px] text-ink-muted">{meta.name}</p>

      {loading ? (
        <div className="mt-2 h-6 w-32 animate-pulse rounded bg-white/[0.06]" />
      ) : quote ? (
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-mono text-[22px] font-semibold tracking-tight text-ink">
            {formatCurrency(quote.price)}
          </span>
          <span className={cn("font-mono text-[13px] font-medium", positive ? "text-emerald-signal" : "text-rose-signal")}>
            {formatPercent(quote.changePercent, { signed: true })}
          </span>
        </div>
      ) : !configured ? (
        <p className="mt-1.5 text-[13px] text-ink-faint">Live pricing not connected</p>
      ) : (
        <p className="mt-1.5 text-[13px] text-ink-faint">No quote available</p>
      )}
    </div>
  );
}

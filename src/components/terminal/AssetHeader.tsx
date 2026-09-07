"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatPercent, formatSignedCurrency } from "@/lib/utils/formatting";
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
        <button onClick={() => router.back()} className="text-ink-muted lg:hidden" aria-label="Back">
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-baseline gap-2">
          <h1 className="text-[15px] font-semibold tracking-tight text-ink">{meta.symbol}</h1>
          <span className="text-[12px] text-ink-faint">{meta.name}</span>
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
          <Star className={cn("h-[18px] w-[18px]", watched && "fill-emerald-signal text-emerald-signal")} />
        </button>
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="h-9 w-32 animate-pulse rounded bg-white/[0.06]" />
        ) : quote ? (
          <>
            <p className="font-mono text-[32px] font-semibold leading-none tracking-tight tabular-nums text-ink">
              {formatCurrency(quote.price)}
            </p>
            <p className={cn("mt-1.5 font-mono text-[13px] font-medium tabular-nums", positive ? "text-emerald-signal" : "text-rose-signal")}>
              {formatSignedCurrency(quote.changeAbsolute)} ({formatPercent(quote.changePercent, { signed: true })}){" "}
              <span className="font-sans font-normal text-ink-faint">Today</span>
            </p>
          </>
        ) : !configured ? (
          <p className="text-[12px] text-ink-faint">Live pricing not connected</p>
        ) : (
          <p className="text-[12px] text-ink-faint">No quote available</p>
        )}
      </div>
    </div>
  );
}

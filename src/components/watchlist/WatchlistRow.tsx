"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { MarketRow } from "@/components/markets/MarketRow";
import { toggleWatchlist } from "@/lib/actions/watchlist";
import type { SymbolMeta } from "@/lib/data/symbols";

export function WatchlistRow({ meta }: { meta: SymbolMeta }) {
  const [removed, setRemoved] = useState(false);
  const [pending, startTransition] = useTransition();

  if (removed) return null;

  return (
    <div className="flex items-center">
      <div className="flex-1">
        <MarketRow meta={meta} />
      </div>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await toggleWatchlist(meta.symbol);
            if (result.watching === false) setRemoved(true);
          })
        }
        aria-label="Remove from watchlist"
        className="mr-5 shrink-0 text-ink-faint active:scale-90 transition-transform"
      >
        <Star className="h-[18px] w-[18px] fill-emerald-signal text-emerald-signal" />
      </button>
    </div>
  );
}

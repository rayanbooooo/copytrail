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

  function remove() {
    startTransition(async () => {
      const result = await toggleWatchlist(meta.symbol);
      if (result.watching === false) setRemoved(true);
    });
  }

  return (
    <div className="relative flex items-center lg:block">
      <div className="flex-1 lg:block">
        <MarketRow meta={meta} />
      </div>
      <button
        disabled={pending}
        onClick={remove}
        aria-label="Remove from watchlist"
        className="mr-3 shrink-0 text-ink-faint transition-transform active:scale-90 lg:absolute lg:right-3 lg:top-3 lg:mr-0 lg:z-10"
      >
        <Star className="h-[18px] w-[18px] fill-emerald-signal text-emerald-signal" />
      </button>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FilterChips } from "@/components/ui/FilterChip";
import { ConfigMissingBanner } from "@/components/ui/ConfigMissingBanner";
import { MarketRow } from "@/components/markets/MarketRow";
import { SYMBOL_UNIVERSE } from "@/lib/data/symbols";

const FILTERS = ["All", "Stocks", "Forex"] as const;

export function MarketsList({ marketDataConfigured }: { marketDataConfigured: boolean }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    return SYMBOL_UNIVERSE.filter((s) => {
      const matchesFilter =
        filter === "All" ||
        (filter === "Stocks" && s.assetClass === "equity") ||
        (filter === "Forex" && s.assetClass === "forex");
      const matchesQuery =
        query.trim() === "" ||
        s.symbol.toLowerCase().includes(query.toLowerCase()) ||
        s.name.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 rounded-full bg-white/[0.06] px-4 py-2.5">
        <Search className="h-4 w-4 text-ink-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stocks, forex…"
          className="w-full bg-transparent text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>

      <FilterChips options={FILTERS} value={filter} onChange={setFilter} />

      {!marketDataConfigured && (
        <ConfigMissingBanner
          service="Alpaca Market Data"
          detail="Add ALPACA_MARKET_DATA_API_KEY_ID/SECRET to show live prices here."
        />
      )}

      <div className="divide-y divide-hairline-soft">
        {results.map((meta) => (
          <MarketRow key={meta.symbol} meta={meta} />
        ))}
        {results.length === 0 && (
          <p className="px-3 py-6 text-center text-[13px] text-ink-muted">No matches.</p>
        )}
      </div>
    </div>
  );
}

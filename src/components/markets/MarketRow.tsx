"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatPercent } from "@/lib/utils/formatting";
import { Sparkline } from "@/components/ui/Sparkline";
import { getSymbolAccent, type SymbolMeta } from "@/lib/data/symbols";
import { cn } from "@/lib/utils/cn";
import type { OrderQuote } from "@/types/domain";

export function MarketRow({ meta }: { meta: SymbolMeta }) {
  const [quote, setQuote] = useState<OrderQuote | null>(null);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/market/quote?symbol=${meta.symbol}`)
      .then((r) => r.json())
      .then((body) => {
        if (cancelled) return;
        setConfigured(Boolean(body.configured));
        if (body.quote) setQuote(body.quote);
      });
    return () => {
      cancelled = true;
    };
  }, [meta.symbol]);

  const positive = (quote?.changePercent ?? 0) >= 0;

  return (
    <Link
      href={`/trade/${meta.symbol}`}
      className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-hairline-soft px-3 py-2.5 hover:bg-white/[0.02]"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[9.5px] font-semibold",
            getSymbolAccent(meta.symbol),
          )}
        >
          {meta.symbol.slice(0, 4)}
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-medium leading-tight text-ink">{meta.symbol}</p>
          <p className="truncate text-[11px] leading-tight text-ink-faint">{meta.name}</p>
        </div>
      </div>

      <Sparkline data={quote ? [quote.price] : []} positive={positive} width={56} height={22} className="hidden sm:block" />

      <div className="text-right">
        <p className="font-mono text-[13px] font-medium tabular-nums text-ink">
          {quote ? formatCurrency(quote.price) : configured ? "—" : "N/A"}
        </p>
        {quote && (
          <p className={`font-mono text-[11px] tabular-nums ${positive ? "text-emerald-signal" : "text-rose-signal"}`}>
            {formatPercent(quote.changePercent, { signed: true })}
          </p>
        )}
      </div>
    </Link>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatPercent } from "@/lib/utils/formatting";
import { Sparkline } from "@/components/ui/Sparkline";
import { SymbolBadge } from "@/components/ui/SymbolBadge";
import type { SymbolMeta } from "@/lib/data/symbols";
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
      className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-2.5 transition-colors hover:bg-white/[0.02] lg:block lg:rounded-xl2 lg:border lg:border-white/[0.06] lg:bg-surface lg:p-4 lg:transition-transform lg:duration-200 lg:hover:-translate-y-0.5 lg:hover:border-white/[0.1]"
    >
      <div className="flex min-w-0 items-center gap-2.5 lg:justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <SymbolBadge symbol={meta.symbol} />
          <div className="min-w-0">
            <p className="text-[13px] font-medium leading-tight text-ink">{meta.symbol}</p>
            <p className="truncate text-[11px] leading-tight text-ink-faint">{meta.name}</p>
          </div>
        </div>
        <Sparkline data={quote ? [quote.price] : []} positive={positive} width={48} height={22} className="hidden lg:block" />
      </div>

      <Sparkline data={quote ? [quote.price] : []} positive={positive} width={48} height={22} className="lg:hidden" />

      <div className="text-right lg:mt-3 lg:flex lg:items-end lg:justify-between lg:text-left">
        <p className="font-mono text-[13px] font-medium tabular-nums text-ink lg:text-[16px]">
          {quote ? formatCurrency(quote.price) : configured ? "—" : "N/A"}
        </p>
        {quote && (
          <p className={`font-mono text-[11px] tabular-nums ${positive ? "text-emerald-signal" : "text-rose-signal"} lg:text-[12.5px] lg:font-medium`}>
            {formatPercent(quote.changePercent, { signed: true })}
          </p>
        )}
      </div>
    </Link>
  );
}

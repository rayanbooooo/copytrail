"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatPercent } from "@/lib/utils/formatting";
import { Sparkline } from "@/components/ui/Sparkline";
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
    <Link href={`/trade/${meta.symbol}`} className="block">
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-black/20 text-[10.5px] font-semibold text-ink-muted">
            {meta.symbol.slice(0, 4)}
          </span>
          <div>
            <p className="text-[14px] font-medium text-ink">{meta.symbol}</p>
            <p className="text-[12px] text-ink-faint">{meta.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Sparkline data={quote ? [quote.price] : []} positive={positive} width={48} height={22} />
          <div className="text-right">
            <p className="font-mono text-[14px] font-medium text-ink">
              {quote ? formatCurrency(quote.price) : configured ? "—" : "N/A"}
            </p>
            {quote && (
              <p className={`font-mono text-[11.5px] ${positive ? "text-emerald-signal" : "text-rose-signal"}`}>
                {formatPercent(quote.changePercent, { signed: true })}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

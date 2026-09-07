"use client";

import Link from "next/link";
import { getSymbolMeta } from "@/lib/data/symbols";
import { useRealtimePrice } from "@/hooks/useRealtimePrice";
import { formatCurrency, formatPercent } from "@/lib/utils/formatting";
import { SymbolBadge } from "@/components/ui/SymbolBadge";
import type { HoldingSummary } from "@/lib/db/queries";

export function HoldingRow({ holding }: { holding: HoldingSummary }) {
  const meta = getSymbolMeta(holding.symbol);
  const { quote, configured } = useRealtimePrice(holding.symbol);
  const positive = (quote?.changePercent ?? 0) >= 0;

  return (
    <Link href={`/trade/${holding.symbol}`} className="flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.02]">
      <div className="flex items-center gap-2.5">
        <SymbolBadge symbol={holding.symbol} />
        <div>
          <p className="text-[13px] font-medium leading-tight text-ink">{meta.symbol}</p>
          <p className="truncate text-[11px] leading-tight text-ink-faint">{meta.name}</p>
        </div>
      </div>

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

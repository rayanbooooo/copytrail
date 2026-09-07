"use client";

import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { FilterChips } from "@/components/ui/FilterChip";
import { Card, CardDivider } from "@/components/ui/Card";
import { formatCurrency, formatQty } from "@/lib/utils/formatting";
import type { TradeRow } from "@/types/database";

const TABS = ["All", "Buy", "Sell"] as const;

export function ActivityList({ trades }: { trades: TradeRow[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");

  const filtered = useMemo(() => {
    if (tab === "All") return trades;
    return trades.filter((t) => t.side === tab.toLowerCase());
  }, [trades, tab]);

  return (
    <div className="space-y-4">
      <FilterChips options={TABS} value={tab} onChange={setTab} />

      <Card className="p-0">
        {filtered.length === 0 ? (
          <p className="px-5 py-6 text-center text-[13px] text-ink-muted">No activity yet.</p>
        ) : (
          filtered.map((trade, i) => (
            <div key={trade.id}>
              {i > 0 && <CardDivider />}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${trade.side === "buy" ? "bg-emerald-signal/15" : "bg-rose-signal/15"}`}
                  >
                    {trade.side === "buy" ? (
                      <ArrowDownLeft className="h-4 w-4 text-emerald-signal" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-rose-signal" />
                    )}
                  </span>
                  <div>
                    <p className="text-[14px] font-medium text-ink">
                      {trade.side === "buy" ? "Buy" : "Sell"} {trade.symbol}
                    </p>
                    <p className="text-[12px] text-ink-faint">
                      {formatQty(trade.qty)} shares · {trade.source === "copy" ? "Copy trade" : "Market order"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[14px] font-medium text-ink">
                    {trade.execution_price ? formatCurrency(trade.execution_price * trade.qty) : "—"}
                  </p>
                  <p className={`text-[11.5px] font-medium ${trade.execution_price ? "text-emerald-signal" : "text-amber-400"}`}>
                    {trade.execution_price ? "Filled" : "Pending"}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

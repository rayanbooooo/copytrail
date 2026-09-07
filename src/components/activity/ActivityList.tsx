"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { FilterChips } from "@/components/ui/FilterChip";
import { Card, CardDivider } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { formatCurrency, formatQty } from "@/lib/utils/formatting";
import { fadeInUp, staggerContainer } from "@/lib/motion/variants";
import type { TradeRow } from "@/types/database";

const TABS = ["All", "Buy", "Sell"] as const;

export function ActivityList({ trades }: { trades: TradeRow[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");

  const filtered = useMemo(() => {
    if (tab === "All") return trades;
    return trades.filter((t) => t.side === tab.toLowerCase());
  }, [trades, tab]);

  const summary = useMemo(() => {
    const filled = trades.filter((t) => t.execution_price !== null);
    const buys = filled.filter((t) => t.side === "buy");
    const sells = filled.filter((t) => t.side === "sell");
    const totalValue = filled.reduce((sum, t) => sum + (t.execution_price ?? 0) * t.qty, 0);
    return { total: trades.length, buys: buys.length, sells: sells.length, totalValue };
  }, [trades]);

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-[1fr_300px] lg:items-start lg:gap-6 lg:space-y-0">
      <div className="space-y-4 lg:max-w-2xl">
        <FilterChips options={TABS} value={tab} onChange={setTab} />

        <Card className="p-0">
          {filtered.length === 0 ? (
            <p className="px-5 py-6 text-center text-[13px] text-ink-muted">No activity yet.</p>
          ) : (
            <motion.div key={tab} initial="hidden" animate="visible" variants={staggerContainer}>
              {filtered.map((trade, i) => (
                <motion.div key={trade.id} variants={fadeInUp}>
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
                </motion.div>
              ))}
            </motion.div>
          )}
        </Card>
      </div>

      <Card className="hidden lg:block">
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-faint">Summary</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Stat label="Total orders" value={summary.total.toLocaleString()} />
            <Stat label="Filled value" value={formatCurrency(summary.totalValue)} align="center" />
          </div>
          <CardDivider />
          <div className="flex items-center justify-between">
            <Stat label="Buys" value={summary.buys.toLocaleString()} tone="positive" />
            <Stat label="Sells" value={summary.sells.toLocaleString()} tone="negative" align="center" />
          </div>
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ChartWrapper } from "@/components/terminal/ChartWrapper";
import { TimeframeControl, type Timeframe } from "@/components/terminal/TimeframeControl";
import { OHLCGrid } from "@/components/terminal/OHLCGrid";
import { ContentTabs } from "@/components/terminal/ContentTabs";
import { BuySellBar } from "@/components/terminal/BuySellBar";
import { OrderForm } from "@/components/terminal/OrderForm";
import { Card, CardDivider } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { useRealtimePrice } from "@/hooks/useRealtimePrice";
import { formatCurrency, formatQty } from "@/lib/utils/formatting";
import type { SymbolMeta } from "@/lib/data/symbols";
import type { TradeRow } from "@/types/database";
import type { Bar } from "@/lib/alpaca/marketDataStream";

export function TerminalBody({
  meta,
  buyingPower,
  symbolTrades,
}: {
  meta: SymbolMeta;
  buyingPower: number;
  symbolTrades: TradeRow[];
}) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const { quote } = useRealtimePrice(meta.symbol);
  const [bar, setBar] = useState<Bar | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/market/bars?symbol=${meta.symbol}&timeframe=${timeframe}`)
      .then((r) => r.json())
      .then((body) => {
        if (cancelled) return;
        const bars = body.bars as Bar[] | undefined;
        setBar(bars && bars.length > 0 ? bars[bars.length - 1]! : null);
      });
    return () => {
      cancelled = true;
    };
  }, [meta.symbol, timeframe]);

  return (
    <div className="space-y-4">
      <div className="lg:grid lg:grid-cols-[1.6fr_1fr] lg:items-start lg:gap-4">
        <div className="space-y-4">
          <ChartWrapper symbol={meta.symbol} timeframe={timeframe} />
          <TimeframeControl value={timeframe} onChange={setTimeframe} />

          <OHLCGrid bar={bar} />

          <BuySellBar symbol={meta.symbol} buyingPower={buyingPower} price={quote?.price ?? null} />

          <ContentTabs meta={meta} />
        </div>

        <div className="mt-3 hidden lg:mt-0 lg:block">
          <Card className="sticky top-6">
            <OrderForm symbol={meta.symbol} buyingPower={buyingPower} price={quote?.price ?? null} />
          </Card>
        </div>
      </div>

      <div className="hidden lg:block">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
          Your orders in {meta.symbol}
        </h3>
        <Card className="p-0">
          {symbolTrades.length === 0 ? (
            <p className="px-4 py-4 text-[13px] text-ink-muted">No orders in {meta.symbol} yet.</p>
          ) : (
            symbolTrades.map((trade, i) => (
              <div key={trade.id}>
                {i > 0 && <CardDivider />}
                <div className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[12.5px] font-semibold ${trade.side === "buy" ? "text-emerald-signal" : "text-rose-signal"}`}
                    >
                      {trade.side === "buy" ? "Buy" : "Sell"}
                    </span>
                    <span className="text-[12.5px] text-ink-muted">
                      {formatQty(trade.qty)} shares · {trade.order_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[12.5px] tabular-nums text-ink">
                      {trade.execution_price ? formatCurrency(trade.execution_price) : "—"}
                    </span>
                    <Pill tone={trade.execution_price ? "emerald" : "amber"}>
                      {trade.execution_price ? "Filled" : "Pending"}
                    </Pill>
                  </div>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}

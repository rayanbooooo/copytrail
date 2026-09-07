"use client";

import { useState } from "react";
import { ChartWrapper } from "@/components/terminal/ChartWrapper";
import { TimeframeControl, type Timeframe } from "@/components/terminal/TimeframeControl";
import { BuySellBar } from "@/components/terminal/BuySellBar";
import { OrderForm } from "@/components/terminal/OrderForm";
import { Card } from "@/components/ui/Card";
import { useRealtimePrice } from "@/hooks/useRealtimePrice";
import type { SymbolMeta } from "@/lib/data/symbols";

export function TerminalBody({
  meta,
  buyingPower,
}: {
  meta: SymbolMeta;
  buyingPower: number;
}) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
  const { quote } = useRealtimePrice(meta.symbol);

  return (
    <div className="lg:grid lg:grid-cols-[1.6fr_1fr] lg:items-start lg:gap-4">
      <div className="space-y-3">
        <div className="flex justify-end">
          <TimeframeControl value={timeframe} onChange={setTimeframe} />
        </div>
        <ChartWrapper symbol={meta.symbol} timeframe={timeframe} />

        <Card>
          <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            About {meta.symbol}
          </h3>
          <p className="text-[12.5px] leading-relaxed text-ink-muted">{meta.description}</p>
        </Card>

        <BuySellBar symbol={meta.symbol} buyingPower={buyingPower} price={quote?.price ?? null} />
      </div>

      <div className="mt-3 hidden lg:mt-0 lg:block">
        <Card className="sticky top-6">
          <OrderForm symbol={meta.symbol} buyingPower={buyingPower} price={quote?.price ?? null} />
        </Card>
      </div>
    </div>
  );
}

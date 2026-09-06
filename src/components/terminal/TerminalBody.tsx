"use client";

import { useState } from "react";
import { ChartWrapper } from "@/components/terminal/ChartWrapper";
import { TimeframeControl, type Timeframe } from "@/components/terminal/TimeframeControl";
import { OrderTicket } from "@/components/terminal/OrderTicket";

export function TerminalBody({ symbol, buyingPower }: { symbol: string; buyingPower: number }) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1M");

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <TimeframeControl value={timeframe} onChange={setTimeframe} />
      </div>
      <ChartWrapper symbol={symbol} timeframe={timeframe} />
      <OrderTicket symbol={symbol} buyingPower={buyingPower} />
    </div>
  );
}

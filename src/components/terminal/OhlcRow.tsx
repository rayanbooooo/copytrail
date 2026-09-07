"use client";

import { useEffect, useState } from "react";
import { Stat } from "@/components/ui/Stat";
import { formatCurrency } from "@/lib/utils/formatting";
import type { Bar } from "@/lib/alpaca/marketDataStream";

export function OhlcRow({ symbol }: { symbol: string }) {
  const [bar, setBar] = useState<Bar | null>(null);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/market/bars?symbol=${symbol}&timeframe=1M`)
      .then((r) => r.json())
      .then((body) => {
        if (cancelled) return;
        setConfigured(Boolean(body.configured));
        const bars = body.bars as Bar[] | undefined;
        if (bars && bars.length > 0) setBar(bars[bars.length - 1]!);
      });
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  if (!configured || !bar) return null;

  return (
    <div className="grid grid-cols-4 gap-3 rounded-xl border border-hairline-soft bg-black/20 px-4 py-3">
      <Stat label="Open" value={formatCurrency(bar.open)} />
      <Stat label="High" value={formatCurrency(bar.high)} />
      <Stat label="Low" value={formatCurrency(bar.low)} />
      <Stat label="Volume" value={new Intl.NumberFormat("en-US", { notation: "compact" }).format(bar.volume)} />
    </div>
  );
}

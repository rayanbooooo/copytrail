"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Sparkline } from "@/components/ui/Sparkline";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Stat } from "@/components/ui/Stat";
import { formatCurrency, formatSignedCurrency, formatPercent } from "@/lib/utils/formatting";
import type { WalletSnapshotRow } from "@/types/database";

const TIMEFRAMES = ["1D", "1W", "1M", "3M", "1Y", "ALL"] as const;
type Timeframe = (typeof TIMEFRAMES)[number];

const WINDOW: Record<Timeframe, number> = { "1D": 2, "1W": 7, "1M": 30, "3M": 90, "1Y": 365, ALL: 9999 };

export function PortfolioHeroCard({
  snapshots,
  cashBalance,
  portfolioValue,
}: {
  snapshots: WalletSnapshotRow[];
  cashBalance: number;
  portfolioValue: number;
}) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const total = cashBalance + portfolioValue;

  const windowed = useMemo(() => {
    const n = WINDOW[timeframe];
    return snapshots.slice(-n);
  }, [snapshots, timeframe]);

  const series = windowed.map((s) => s.cash_balance + s.portfolio_value);
  const first = series[0];
  const changeAbsolute = series.length >= 2 && first !== undefined ? total - first : 0;
  const changePercent = series.length >= 2 && first ? (changeAbsolute / first) * 100 : 0;
  const positive = changeAbsolute >= 0;

  const todaysPnl = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const priorClose = [...snapshots].filter((s) => s.snapshot_date < todayStr).pop();
    if (!priorClose) return null;
    const basis = priorClose.cash_balance + priorClose.portfolio_value;
    const absolute = total - basis;
    const percent = basis ? (absolute / basis) * 100 : 0;
    return { absolute, percent, positive: absolute >= 0 };
  }, [snapshots, total]);

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint">
            Total portfolio value
          </p>
          <p className="mt-1 font-mono text-[28px] font-semibold leading-none tracking-tight tabular-nums text-ink">
            {formatCurrency(total)}
          </p>
          {series.length >= 2 ? (
            <p className={`mt-1.5 font-mono text-[12px] font-medium tabular-nums ${positive ? "text-emerald-signal" : "text-rose-signal"}`}>
              {formatSignedCurrency(changeAbsolute)} ({formatPercent(changePercent, { signed: true })})
            </p>
          ) : (
            <p className="mt-1.5 text-[12px] text-ink-faint">History fills in daily.</p>
          )}
        </div>
        <SegmentedControl options={TIMEFRAMES} value={timeframe} onChange={setTimeframe} />
      </div>

      <div className="my-3 flex h-[56px] items-end">
        <Sparkline data={series} positive={positive} width={320} height={52} className="w-full" />
      </div>

      <div className="flex items-center justify-between rounded border border-hairline-soft bg-black/20 px-3 py-2.5">
        <Stat
          label="Today's P&L"
          value={
            todaysPnl
              ? `${formatSignedCurrency(todaysPnl.absolute)} (${formatPercent(todaysPnl.percent, { signed: true })})`
              : "—"
          }
          tone={todaysPnl ? (todaysPnl.positive ? "positive" : "negative") : "neutral"}
        />
        <Stat label="Invested" value={formatCurrency(portfolioValue)} align="center" />
      </div>
    </Card>
  );
}

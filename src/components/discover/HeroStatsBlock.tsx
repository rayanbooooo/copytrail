import { formatPercent } from "@/lib/utils/formatting";

interface HeroStatsBlockProps {
  aggregateReturn30d: number;
  activeLeaders: number;
}

export function HeroStatsBlock({ aggregateReturn30d, activeLeaders }: HeroStatsBlockProps) {
  const positive = aggregateReturn30d >= 0;

  return (
    <div className="flex items-center justify-between rounded-lg border border-hairline bg-surface px-4 py-3">
      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint">
          Copy pool · 30d return
        </p>
        <p
          className={`mt-1 font-mono text-[22px] font-semibold leading-none tracking-tight tabular-nums ${
            positive ? "text-emerald-signal" : "text-rose-signal"
          }`}
        >
          {formatPercent(aggregateReturn30d, { signed: true })}
        </p>
      </div>
      <p className="text-right text-[12px] text-ink-muted">
        <span className="font-mono text-ink">{activeLeaders}</span> verified
        <br />
        strategies
      </p>
    </div>
  );
}

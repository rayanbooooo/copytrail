import { formatPercent } from "@/lib/utils/formatting";
import { Card } from "@/components/ui/Card";

interface HeroStatsBlockProps {
  aggregateReturn30d: number;
  activeLeaders: number;
}

export function HeroStatsBlock({ aggregateReturn30d, activeLeaders }: HeroStatsBlockProps) {
  const positive = aggregateReturn30d >= 0;

  return (
    <Card className="relative overflow-hidden border-white/[0.1] bg-gradient-to-br from-surface via-surface to-[#0B1911] p-6">
      <div className="relative z-10">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
          Copy pool · 30-day return
        </p>
        <p
          className={`mt-2 font-mono text-[40px] font-semibold leading-none tracking-tight ${
            positive ? "text-emerald-signal" : "text-rose-signal"
          }`}
        >
          {formatPercent(aggregateReturn30d, { signed: true })}
        </p>
        <p className="mt-3 text-[13px] text-ink-muted">
          Averaged across <span className="font-tnum text-ink">{activeLeaders}</span> verified
          strategies on the platform right now.
        </p>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-signal/[0.08] blur-3xl"
      />
    </Card>
  );
}

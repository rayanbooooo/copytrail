import { cn } from "@/lib/utils/cn";

interface StatProps {
  label: string;
  value: string;
  /** Optional smaller second line below the value (e.g. a % delta), colored with `tone`. */
  delta?: string;
  tone?: "neutral" | "positive" | "negative";
  align?: "left" | "center";
  className?: string;
}

const toneClasses = {
  neutral: "text-ink",
  positive: "text-emerald-signal",
  negative: "text-rose-signal",
};

export function Stat({ label, value, delta, tone = "neutral", align = "left", className }: StatProps) {
  return (
    <div className={cn("flex flex-col gap-1", align === "center" && "items-center", className)}>
      <span className="text-[10px] uppercase tracking-wide text-ink-faint">{label}</span>
      <span className={cn("font-mono text-[13px] font-semibold tracking-tight tabular-nums", toneClasses[tone])}>
        {value}
      </span>
      {delta && (
        <span className={cn("font-mono text-[11px] font-medium tabular-nums", toneClasses[tone])}>{delta}</span>
      )}
    </div>
  );
}

export function StatDivider() {
  return <div aria-hidden className="h-8 w-px bg-hairline-soft" />;
}

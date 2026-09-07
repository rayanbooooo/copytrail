import { cn } from "@/lib/utils/cn";

interface StatProps {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
  align?: "left" | "center";
  className?: string;
}

const toneClasses = {
  neutral: "text-ink",
  positive: "text-emerald-signal",
  negative: "text-rose-signal",
};

export function Stat({ label, value, tone = "neutral", align = "left", className }: StatProps) {
  return (
    <div className={cn("flex flex-col gap-1", align === "center" && "items-center", className)}>
      <span className="text-[10px] uppercase tracking-wide text-ink-faint">{label}</span>
      <span className={cn("font-mono text-[13px] font-medium tracking-tight tabular-nums", toneClasses[tone])}>
        {value}
      </span>
    </div>
  );
}

export function StatDivider() {
  return <div aria-hidden className="h-8 w-px bg-hairline-soft" />;
}

import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

type Tone = "neutral" | "emerald" | "rose" | "amber";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-white/[0.06] text-ink-muted border-white/[0.08]",
  emerald: "bg-emerald-signal/10 text-emerald-signal border-emerald-signal/25",
  rose: "bg-rose-signal/10 text-rose-signal border-rose-signal/25",
  amber: "bg-amber-400/10 text-amber-300 border-amber-400/25",
};

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Pill({ tone = "neutral", className, ...props }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

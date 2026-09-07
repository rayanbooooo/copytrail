"use client";

import { cn } from "@/lib/utils/cn";

interface TimeframePillsProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Minimal text-only timeframe row (1D/1W/1M/3M/1Y/ALL) — the active option
 * is just brighter/bolder text, no pill background. Used under the
 * portfolio/asset/performance charts, distinct from the boxed
 * SegmentedControl and the solid-fill FilterChips.
 */
export function TimeframePills<T extends string>({ options, value, onChange, className }: TimeframePillsProps<T>) {
  return (
    <div className={cn("flex w-full items-center justify-between", className)} role="tablist">
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option)}
            className={cn(
              "text-[12px] font-medium transition-colors",
              active ? "text-ink" : "text-ink-faint hover:text-ink-muted",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils/cn";

interface FilterChipsProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Solid-fill pill filters (Markets asset class, Discover tabs, Activity
 * tabs) — visually distinct from TimeframeControl's minimal text-only pills:
 * the active chip gets a bright solid fill, not just a color/weight change.
 */
export function FilterChips<T extends string>({ options, value, onChange, className }: FilterChipsProps<T>) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} role="tablist">
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
              active ? "bg-ink text-[#05060a]" : "bg-white/[0.06] text-ink-muted hover:bg-white/[0.09] hover:text-ink",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

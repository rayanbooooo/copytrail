"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface SegmentedControlProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Boxed segmented control: a dark track holding a sliding solid-fill active
 * pill — used for binary/ternary action toggles (Buy/Sell, Market/Limit,
 * risk level). Distinct from TimeframePills (minimal text-only) and
 * FilterChips (independent solid pills, no shared track).
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn("inline-flex items-center gap-0.5 rounded-full bg-white/[0.06] p-1", className)}
      role="tablist"
    >
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option)}
            className={cn(
              "relative flex-1 rounded-full px-2.5 py-1.5 text-[12.5px] font-medium transition-colors",
              active ? "text-[#03130C]" : "text-ink-faint hover:text-ink-muted",
            )}
          >
            {active && (
              <motion.span
                layoutId={`segmented-control-active-${options.join("-")}`}
                className="absolute inset-0 rounded-full bg-emerald-signal"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative z-10">{option}</span>
          </button>
        );
      })}
    </div>
  );
}

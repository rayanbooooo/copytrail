"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface SegmentedControlProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
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
              "relative flex-1 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors",
              active ? "text-[#03130C]" : "text-ink-faint hover:text-ink-muted",
            )}
          >
            {active && (
              <motion.span
                layoutId={`segmented-control-active-${options.join("-")}`}
                className="absolute inset-0 rounded-lg bg-emerald-signal"
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

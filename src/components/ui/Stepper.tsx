"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  className?: string;
}

export function Stepper({ value, onChange, min = 1, step = 1, className }: StepperProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, Number((value - step).toFixed(6))))}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-black/20 text-ink-muted active:scale-[0.94] transition-transform"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-10 text-center font-mono text-[15px] font-medium text-ink">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Number((value + step).toFixed(6)))}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-black/20 text-ink-muted active:scale-[0.94] transition-transform"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

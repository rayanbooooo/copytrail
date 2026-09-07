"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  onValueChange?: (value: string) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, onValueChange, onBlur, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center gap-1 rounded-lg border border-hairline bg-black/30 px-3 py-2.5",
          "focus-within:border-emerald-signal/50 transition-colors",
          className,
        )}
      >
        <span className="font-mono text-lg font-medium text-ink-faint">$</span>
        <input
          ref={ref}
          inputMode="decimal"
          placeholder="0.00"
          className="w-full bg-transparent font-mono text-lg font-medium tracking-tight tabular-nums text-ink placeholder:text-ink-faint focus:outline-none"
          onChange={(e) => {
            const cleaned = e.target.value.replace(/[^0-9.]/g, "");
            onValueChange?.(cleaned);
          }}
          onBlur={onBlur}
          {...props}
        />
      </div>
    );
  },
);
CurrencyInput.displayName = "CurrencyInput";

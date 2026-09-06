"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "danger" | "outline" | "ghost";
type Size = "md" | "lg" | "sm";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-emerald-signal text-[#03130C] shadow-[0_10px_30px_-10px_rgba(52,211,153,0.55)] hover:bg-[#3EE3A6]",
  danger:
    "bg-rose-signal text-[#1C0509] shadow-[0_10px_30px_-10px_rgba(251,113,133,0.55)] hover:bg-[#FC8A9A]",
  outline: "border border-hairline bg-transparent text-ink hover:border-white/20",
  ghost: "bg-transparent text-ink-muted hover:text-ink",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-medium",
          "transition-[background-color,border-color,color] duration-200",
          "disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

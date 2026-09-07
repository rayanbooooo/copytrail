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
  primary: "bg-emerald-signal text-[#03130C] hover:bg-[#3EE3A6]",
  danger: "bg-rose-signal text-[#1C0509] hover:bg-[#FC8A9A]",
  outline: "border border-hairline bg-transparent text-ink hover:border-white/20",
  ghost: "bg-transparent text-ink-muted hover:text-ink",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-[12.5px]",
  md: "h-11 px-4 text-[14px]",
  lg: "h-12 px-5 text-[15px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium",
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

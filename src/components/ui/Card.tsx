import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-hairline bg-surface p-4",
        "transition-colors duration-200",
        className,
      )}
      {...props}
    />
  );
}

export function CardDivider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-hairline-soft", className)} />;
}

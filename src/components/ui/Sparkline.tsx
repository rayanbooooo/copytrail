import { cn } from "@/lib/utils/cn";

interface SparklineProps {
  data: number[];
  positive?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Minimal inline-SVG sparkline for list rows. When `data` has fewer than 2
 * points (no live market data configured) it renders a flat neutral
 * baseline rather than fabricating a plausible-looking wiggle — consistent
 * with this app's rule of never faking data it doesn't have.
 */
export function Sparkline({ data, positive = true, className, width = 64, height = 28 }: SparklineProps) {
  if (data.length < 2) {
    return (
      <svg width={width} height={height} className={cn("overflow-visible", className)} aria-hidden>
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} strokeDasharray="2 3" />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data
    .map((value, i) => {
      const x = i * stepX;
      const y = height - ((value - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const stroke = positive ? "#34D399" : "#FB7185";

  return (
    <svg width={width} height={height} className={cn("overflow-visible", className)} aria-hidden>
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

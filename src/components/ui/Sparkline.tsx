import { cn } from "@/lib/utils/cn";

interface SparklineProps {
  data: number[];
  positive?: boolean;
  className?: string;
  width?: number;
  height?: number;
  /** Fills the area under the line with a fading gradient — used for the
   * prominent portfolio/asset charts. List-row mini trends stay line-only. */
  filled?: boolean;
}

/**
 * Minimal inline-SVG sparkline. When `data` has fewer than 2 points (no live
 * market data configured) it renders a flat neutral baseline rather than
 * fabricating a plausible-looking wiggle — consistent with this app's rule
 * of never faking data it doesn't have.
 */
export function Sparkline({ data, positive = true, className, width = 64, height = 28, filled = false }: SparklineProps) {
  if (data.length < 2) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={cn("overflow-visible", className)} aria-hidden>
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} strokeDasharray="2 3" />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pad = filled ? 3 : 1.5;
  const drawHeight = height - pad * 2;

  const coords = data.map((value, i) => ({
    x: i * stepX,
    y: pad + drawHeight - ((value - min) / range) * drawHeight,
  }));

  const points = coords.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const stroke = positive ? "#19E38C" : "#FB7185";
  const gradientId = `sparkline-fill-${positive ? "up" : "down"}`;

  const areaPath = filled
    ? `M${coords[0]!.x},${height} L${points.split(" ").join(" L")} L${coords[coords.length - 1]!.x},${height} Z`
    : null;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={cn("overflow-visible", className)} aria-hidden>
      {filled && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.32} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
      )}
      {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />}
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={filled ? 2 : 1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

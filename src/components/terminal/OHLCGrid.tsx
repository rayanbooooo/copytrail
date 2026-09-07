import { formatCurrency } from "@/lib/utils/formatting";
import type { Bar } from "@/lib/alpaca/marketDataStream";

const volumeFormatter = new Intl.NumberFormat("en-US", { notation: "compact" });

export function OHLCGrid({ bar }: { bar: Bar | null }) {
  if (!bar) return null;

  const rows = [
    { label: "Open", value: formatCurrency(bar.open) },
    { label: "High", value: formatCurrency(bar.high) },
    { label: "Low", value: formatCurrency(bar.low) },
    { label: "Volume", value: volumeFormatter.format(bar.volume) },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between">
          <span className="text-[12.5px] text-ink-muted">{row.label}</span>
          <span className="font-mono text-[12.5px] font-medium tabular-nums text-ink">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

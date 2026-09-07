"use client";

import { TimeframePills } from "@/components/ui/TimeframePills";

export const TIMEFRAMES = ["1D", "1W", "1M", "3M", "1Y", "5Y"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];

export function TimeframeControl({
  value,
  onChange,
}: {
  value: Timeframe;
  onChange: (value: Timeframe) => void;
}) {
  return <TimeframePills options={TIMEFRAMES} value={value} onChange={onChange} />;
}

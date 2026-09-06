"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";

export const TIMEFRAMES = ["1D", "1W", "1M", "3M", "1Y"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];

export function TimeframeControl({
  value,
  onChange,
}: {
  value: Timeframe;
  onChange: (value: Timeframe) => void;
}) {
  return <SegmentedControl options={TIMEFRAMES} value={value} onChange={onChange} />;
}

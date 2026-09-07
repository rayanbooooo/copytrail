"use client";

import { useEffect, useRef, useState } from "react";
import type { IChartApi, ISeriesApi } from "lightweight-charts";
import { ConfigMissingBanner } from "@/components/ui/ConfigMissingBanner";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Timeframe } from "@/components/terminal/TimeframeControl";

interface ChartWrapperProps {
  symbol: string;
  timeframe: Timeframe;
}

const UP = { line: "#19E38C", top: "rgba(25,227,140,0.32)", bottom: "rgba(25,227,140,0)" };
const DOWN = { line: "#FB7185", top: "rgba(251,113,133,0.32)", bottom: "rgba(251,113,133,0)" };

export function ChartWrapper({ symbol, timeframe }: ChartWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const [state, setState] = useState<"loading" | "empty" | "unconfigured" | "ready">("loading");

  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;

    import("lightweight-charts").then(({ createChart, ColorType }) => {
      if (disposed || !containerRef.current) return;

      const chart = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "#000000" },
          textColor: "#9CA1AF",
          fontFamily: "IBM Plex Mono, ui-monospace, monospace",
        },
        grid: {
          vertLines: { visible: false },
          horzLines: { color: "rgba(255,255,255,0.04)" },
        },
        crosshair: {
          vertLine: { color: "rgba(255,255,255,0.15)", labelBackgroundColor: "#101114" },
          horzLine: { color: "rgba(255,255,255,0.15)", labelBackgroundColor: "#101114" },
        },
        rightPriceScale: { borderVisible: false },
        timeScale: { borderVisible: false },
        autoSize: true,
      });

      const series = chart.addAreaSeries({
        lineColor: UP.line,
        topColor: UP.top,
        bottomColor: UP.bottom,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      chartRef.current = chart;
      seriesRef.current = series;
    });

    return () => {
      disposed = true;
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBars() {
      setState("loading");
      const response = await fetch(
        `/api/market/bars?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}`,
      );
      const body = await response.json();
      if (cancelled) return;

      if (!body.configured) {
        setState("unconfigured");
        return;
      }
      const bars: Array<{ time: number; close: number }> = body.bars ?? [];
      if (!bars || bars.length === 0) {
        setState("empty");
        return;
      }

      const positive = bars[bars.length - 1]!.close >= bars[0]!.close;
      const palette = positive ? UP : DOWN;
      seriesRef.current?.applyOptions({ lineColor: palette.line, topColor: palette.top, bottomColor: palette.bottom });
      seriesRef.current?.setData(bars.map((bar) => ({ time: bar.time, value: bar.close })) as any);
      chartRef.current?.timeScale().fitContent();
      setState("ready");
    }

    loadBars();
    return () => {
      cancelled = true;
    };
  }, [symbol, timeframe]);

  return (
    <div className="relative h-[280px] w-full overflow-hidden rounded-xl2 bg-black lg:h-[400px]">
      <div ref={containerRef} className="h-full w-full" />
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <Skeleton className="h-[180px] w-[92%]" />
        </div>
      )}
      {state === "unconfigured" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black p-6">
          <ConfigMissingBanner
            service="Alpaca Market Data"
            detail="Add ALPACA_MARKET_DATA_API_KEY_ID/SECRET to stream live charts."
          />
        </div>
      )}
      {state === "empty" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <p className="text-sm text-ink-faint">No bar data for {symbol} yet.</p>
        </div>
      )}
    </div>
  );
}

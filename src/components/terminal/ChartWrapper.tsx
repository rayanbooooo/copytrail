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

export function ChartWrapper({ symbol, timeframe }: ChartWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [state, setState] = useState<"loading" | "empty" | "unconfigured" | "ready">("loading");

  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;

    import("lightweight-charts").then(({ createChart, ColorType }) => {
      if (disposed || !containerRef.current) return;

      const chart = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "#090A0F" },
          textColor: "#9CA1AF",
          fontFamily: "IBM Plex Mono, ui-monospace, monospace",
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.03)" },
          horzLines: { color: "rgba(255,255,255,0.03)" },
        },
        crosshair: {
          vertLine: { color: "rgba(255,255,255,0.15)", labelBackgroundColor: "#12141C" },
          horzLine: { color: "rgba(255,255,255,0.15)", labelBackgroundColor: "#12141C" },
        },
        rightPriceScale: { borderColor: "rgba(255,255,255,0.06)" },
        timeScale: { borderColor: "rgba(255,255,255,0.06)" },
        autoSize: true,
      });

      // v4 API: series are created via type-specific factory methods
      // (addCandlestickSeries), not the v5 generic addSeries(SeriesType, ...).
      const series = chart.addCandlestickSeries({
        upColor: "#34D399",
        downColor: "#FB7185",
        borderVisible: false,
        wickUpColor: "#34D399",
        wickDownColor: "#FB7185",
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
      if (!body.bars || body.bars.length === 0) {
        setState("empty");
        return;
      }

      seriesRef.current?.setData(body.bars);
      chartRef.current?.timeScale().fitContent();
      setState("ready");
    }

    loadBars();
    return () => {
      cancelled = true;
    };
  }, [symbol, timeframe]);

  return (
    <div className="relative h-[280px] w-full overflow-hidden rounded-2xl border border-hairline bg-base">
      <div ref={containerRef} className="h-full w-full" />
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-base">
          <Skeleton className="h-[220px] w-[92%]" />
        </div>
      )}
      {state === "unconfigured" && (
        <div className="absolute inset-0 flex items-center justify-center bg-base p-6">
          <ConfigMissingBanner
            service="Alpaca Market Data"
            detail="Add ALPACA_MARKET_DATA_API_KEY_ID/SECRET to stream live charts."
          />
        </div>
      )}
      {state === "empty" && (
        <div className="absolute inset-0 flex items-center justify-center bg-base">
          <p className="text-sm text-ink-faint">No bar data for {symbol} yet.</p>
        </div>
      )}
    </div>
  );
}

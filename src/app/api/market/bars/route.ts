import { NextResponse } from "next/server";
import { fetchHistoricalBars } from "@/lib/alpaca/marketDataStream";
import { isAlpacaMarketDataConfigured } from "@/lib/config/env";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const symbol = params.get("symbol");
  const timeframe = params.get("timeframe") ?? "1M";
  if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 });

  if (!isAlpacaMarketDataConfigured()) {
    return NextResponse.json({ configured: false, bars: [] });
  }

  const bars = await fetchHistoricalBars(symbol.toUpperCase(), timeframe);
  return NextResponse.json({ configured: true, bars });
}

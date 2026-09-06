import { NextResponse } from "next/server";
import { fetchLatestQuote } from "@/lib/alpaca/marketDataStream";
import { isAlpacaMarketDataConfigured } from "@/lib/config/env";

export async function GET(request: Request) {
  const symbol = new URL(request.url).searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 });

  if (!isAlpacaMarketDataConfigured()) {
    return NextResponse.json({ configured: false, quote: null });
  }

  const quote = await fetchLatestQuote(symbol.toUpperCase());
  return NextResponse.json({ configured: true, quote });
}

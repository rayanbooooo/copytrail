import "server-only";
import { getEnv, isAlpacaMarketDataConfigured } from "@/lib/config/env";
import type { OrderQuote } from "@/types/domain";

/**
 * A persistent websocket to Alpaca's market data stream can't live inside a
 * serverless Next.js function (see plan risk #2). This module intentionally
 * only exposes a REST snapshot fetch for now; `useRealtimePrice` polls it.
 * Swapping in a real-time relay later (a small always-on worker publishing
 * over Supabase Realtime) only requires changing that hook, not this file's
 * callers.
 */
export async function fetchLatestQuote(symbol: string): Promise<OrderQuote | null> {
  if (!isAlpacaMarketDataConfigured()) return null;

  const env = getEnv();
  const basicAuth = Buffer.from(
    `${env.ALPACA_MARKET_DATA_API_KEY_ID}:${env.ALPACA_MARKET_DATA_API_SECRET}`,
  ).toString("base64");

  const isForex = symbol.length === 6 && !symbol.includes(".");
  const url = isForex
    ? `https://data.alpaca.markets/v1beta1/forex/latest/rates?symbols=${symbol}`
    : `https://data.alpaca.markets/v2/stocks/${symbol}/quotes/latest`;

  const response = await fetch(url, {
    headers: { Authorization: `Basic ${basicAuth}` },
    cache: "no-store",
  });

  if (!response.ok) return null;
  const body = await response.json();

  if (isForex) {
    const rate = body?.rates?.[symbol];
    if (!rate) return null;
    return {
      symbol,
      price: rate.rate,
      changeAbsolute: 0,
      changePercent: 0,
      assetClass: "forex",
      asOf: rate.timestamp ?? new Date().toISOString(),
    };
  }

  const quote = body?.quote;
  if (!quote) return null;
  const price = (quote.bp + quote.ap) / 2;
  return {
    symbol,
    price,
    changeAbsolute: 0,
    changePercent: 0,
    assetClass: "equity",
    asOf: quote.t ?? new Date().toISOString(),
  };
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { OrderQuote } from "@/types/domain";

interface UseRealtimePriceResult {
  quote: OrderQuote | null;
  configured: boolean;
  loading: boolean;
}

/**
 * Polls the REST quote snapshot every 5s. A persistent Alpaca market-data
 * websocket can't live inside a serverless function (see plan risk #2) —
 * this hook is the single place that would swap to a Supabase Realtime
 * broadcast relay later without touching any consumer.
 */
export function useRealtimePrice(symbol: string, intervalMs = 5000): UseRealtimePriceResult {
  const [quote, setQuote] = useState<OrderQuote | null>(null);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const lastPriceRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const response = await fetch(`/api/market/quote?symbol=${encodeURIComponent(symbol)}`);
        const body = await response.json();
        if (cancelled) return;

        setConfigured(Boolean(body.configured));
        if (body.quote) {
          const previous = lastPriceRef.current;
          const changeAbsolute = previous != null ? body.quote.price - previous : 0;
          const changePercent = previous ? (changeAbsolute / previous) * 100 : 0;
          lastPriceRef.current = body.quote.price;
          setQuote({ ...body.quote, changeAbsolute, changePercent });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    poll();
    const id = setInterval(poll, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [symbol, intervalMs]);

  return { quote, configured, loading };
}

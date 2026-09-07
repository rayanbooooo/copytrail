export interface SymbolMeta {
  symbol: string;
  name: string;
  assetClass: "equity" | "forex";
  description: string;
}

// Curated tradable universe for the Markets screen and asset-detail "About"
// copy. Real quotes/bars still come from Alpaca Market Data at request time
// (or show a config-missing state) — this is just the catalog of what's
// browsable, not fabricated price data.
export const SYMBOL_UNIVERSE: SymbolMeta[] = [
  { symbol: "AAPL", name: "Apple Inc.", assetClass: "equity", description: "Designs, manufactures, and markets smartphones, personal computers, wearables, and accessories worldwide." },
  { symbol: "MSFT", name: "Microsoft Corp.", assetClass: "equity", description: "Develops, licenses, and supports software, services, devices, and solutions worldwide." },
  { symbol: "NVDA", name: "NVIDIA Corp.", assetClass: "equity", description: "Designs graphics processing units and system-on-chip units for gaming, professional, and data-center markets." },
  { symbol: "TSLA", name: "Tesla Inc.", assetClass: "equity", description: "Designs, develops, manufactures, and sells electric vehicles and energy generation and storage systems." },
  { symbol: "AMZN", name: "Amazon.com Inc.", assetClass: "equity", description: "Engages in the retail sale of consumer products and subscriptions, and provides cloud computing services." },
  { symbol: "META", name: "Meta Platforms Inc.", assetClass: "equity", description: "Builds technologies that help people connect, find communities, and grow businesses." },
  { symbol: "EURUSD", name: "Euro / US Dollar", assetClass: "forex", description: "The most heavily traded currency pair, tracking the exchange rate between the Eurozone and the United States." },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", assetClass: "forex", description: "Tracks the exchange rate between the United Kingdom and the United States." },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", assetClass: "forex", description: "Tracks the exchange rate between the United States and Japan." },
];

export function getSymbolMeta(symbol: string): SymbolMeta {
  return (
    SYMBOL_UNIVERSE.find((s) => s.symbol === symbol.toUpperCase()) ?? {
      symbol: symbol.toUpperCase(),
      name: symbol.toUpperCase(),
      assetClass: symbol.length === 6 ? "forex" : "equity",
      description: "No description available for this symbol yet.",
    }
  );
}

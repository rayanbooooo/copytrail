import { getSymbolAccent } from "@/lib/data/symbols";
import { cn } from "@/lib/utils/cn";

export function SymbolBadge({ symbol, size = 36 }: { symbol: string; size?: number }) {
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold",
        getSymbolAccent(symbol),
      )}
    >
      {symbol.slice(0, 1)}
    </span>
  );
}

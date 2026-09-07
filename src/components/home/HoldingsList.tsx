import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getSymbolAccent, getSymbolMeta } from "@/lib/data/symbols";
import { formatQty } from "@/lib/utils/formatting";
import { cn } from "@/lib/utils/cn";
import type { HoldingSummary } from "@/lib/db/queries";

export function HoldingsList({ holdings }: { holdings: HoldingSummary[] }) {
  if (holdings.length === 0) {
    return (
      <Card>
        <p className="text-[13px] text-ink-muted">
          No open positions yet. Head to Markets to place your first trade.
        </p>
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-hairline-soft p-0">
      {holdings.map((holding, i) => {
        const meta = getSymbolMeta(holding.symbol);
        return (
          <Link key={holding.symbol} href={`/trade/${holding.symbol}`} className="block hover:bg-white/[0.02]">
            <div className={`flex items-center justify-between px-3 py-2.5 ${i > 0 ? "border-t border-hairline-soft" : ""}`}>
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg text-[9.5px] font-semibold",
                    getSymbolAccent(holding.symbol),
                  )}
                >
                  {holding.symbol.slice(0, 4)}
                </span>
                <div>
                  <p className="text-[13px] font-medium leading-tight text-ink">{meta.symbol}</p>
                  <p className="text-[11px] leading-tight text-ink-faint">{formatQty(holding.qty)} shares</p>
                </div>
              </div>
              <span className="text-[11px] text-ink-faint">{meta.name}</span>
            </div>
          </Link>
        );
      })}
    </Card>
  );
}

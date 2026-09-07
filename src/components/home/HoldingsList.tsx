import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getSymbolMeta } from "@/lib/data/symbols";
import { formatQty } from "@/lib/utils/formatting";
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
          <Link key={holding.symbol} href={`/trade/${holding.symbol}`} className="block">
            <div className={`flex items-center justify-between px-5 py-4 ${i > 0 ? "border-t border-hairline-soft" : ""}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-black/20 text-[11px] font-semibold text-ink-muted">
                  {holding.symbol.slice(0, 4)}
                </span>
                <div>
                  <p className="text-[14px] font-medium text-ink">{meta.name}</p>
                  <p className="text-[12px] text-ink-faint">{formatQty(holding.qty)} shares</p>
                </div>
              </div>
              <span className="text-[12px] text-ink-faint">View</span>
            </div>
          </Link>
        );
      })}
    </Card>
  );
}

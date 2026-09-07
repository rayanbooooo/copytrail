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
          <Link key={holding.symbol} href={`/trade/${holding.symbol}`} className="block hover:bg-white/[0.02]">
            <div className={`flex items-center justify-between px-3 py-2.5 ${i > 0 ? "border-t border-hairline-soft" : ""}`}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded border border-hairline bg-black/30 text-[9.5px] font-semibold text-ink-muted">
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

import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Card, CardDivider } from "@/components/ui/Card";
import { formatCurrency, formatQty } from "@/lib/utils/formatting";
import type { TradeRow } from "@/types/database";

export function RecentActivity({ trades }: { trades: TradeRow[] }) {
  if (trades.length === 0) {
    return (
      <Card>
        <p className="text-[13px] text-ink-muted">No activity yet.</p>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      {trades.slice(0, 4).map((trade, i) => (
        <div key={trade.id}>
          {i > 0 && <CardDivider />}
          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-black/20">
                {trade.side === "buy" ? (
                  <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-signal" />
                ) : (
                  <ArrowUpRight className="h-3.5 w-3.5 text-rose-signal" />
                )}
              </span>
              <div>
                <p className="text-[13px] font-medium leading-tight text-ink">
                  {trade.side === "buy" ? "Buy" : "Sell"} {trade.symbol}
                </p>
                <p className="text-[11px] leading-tight text-ink-faint">{formatQty(trade.qty)} shares</p>
              </div>
            </div>
            <p className="font-mono text-[13px] font-medium tabular-nums text-ink">
              {trade.execution_price ? formatCurrency(trade.execution_price * trade.qty) : "—"}
            </p>
          </div>
        </div>
      ))}
      {trades.length > 4 && (
        <Link
          href="/activity"
          className="block border-t border-hairline-soft px-3 py-2.5 text-center text-[12px] font-medium text-ink-muted hover:text-ink"
        >
          See all activity
        </Link>
      )}
    </Card>
  );
}

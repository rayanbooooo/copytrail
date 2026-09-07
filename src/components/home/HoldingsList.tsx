import { Card } from "@/components/ui/Card";
import { HoldingRow } from "@/components/home/HoldingRow";
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
      {holdings.map((holding) => (
        <HoldingRow key={holding.symbol} holding={holding} />
      ))}
    </Card>
  );
}

import { Card, CardDivider } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/formatting";
import Link from "next/link";

interface PortfolioBalanceCardProps {
  cashBalance: number;
  portfolioValue: number;
}

export function PortfolioBalanceCard({ cashBalance, portfolioValue }: PortfolioBalanceCardProps) {
  const total = cashBalance + portfolioValue;

  return (
    <Card className="border-white/[0.1]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        Total portfolio value
      </p>
      <p className="mt-2 font-mono text-[36px] font-semibold leading-none tracking-tight text-ink">
        {formatCurrency(total)}
      </p>

      <CardDivider className="my-4" />

      <div className="flex items-center justify-between">
        <Stat label="Cash available" value={formatCurrency(cashBalance)} />
        <Stat label="Invested" value={formatCurrency(portfolioValue)} align="center" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link href="/onboarding/fund" className="contents">
          <Button fullWidth>Deposit</Button>
        </Link>
        <Link href="/onboarding/fund" className="contents">
          <Button fullWidth variant="outline">
            Withdraw
          </Button>
        </Link>
      </div>
    </Card>
  );
}

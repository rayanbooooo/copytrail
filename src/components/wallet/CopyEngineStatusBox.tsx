import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { formatCurrency } from "@/lib/utils/formatting";

interface CopyEngineStatusBoxProps {
  following: {
    leaderName: string;
    allocationAmount: number;
  } | null;
  nextBillingDate: string | null;
}

export function CopyEngineStatusBox({ following, nextBillingDate }: CopyEngineStatusBoxProps) {
  if (!following) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-ink">Copy-trading engine</h3>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              You&apos;re not mirroring a trader yet.
            </p>
          </div>
          <Pill tone="neutral">Idle</Pill>
        </div>
        <Link href="/discover">
          <Button fullWidth className="mt-4" variant="outline">
            Browse the leaderboard
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="border-emerald-500/20">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-ink">Copy-trading engine</h3>
        <Pill tone="emerald" className="gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse-slow rounded-full bg-emerald-signal" />
          Active
        </Pill>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-hairline-soft bg-black/20 px-4 py-3">
        <Stat label="Mirroring" value={following.leaderName} />
        <Stat label="Allocation" value={formatCurrency(following.allocationAmount)} align="center" />
      </div>

      {nextBillingDate && (
        <p className="mt-3 text-[12px] text-ink-faint">
          Next $15.00 billing cycle · {new Date(nextBillingDate).toLocaleDateString()}
        </p>
      )}
    </Card>
  );
}

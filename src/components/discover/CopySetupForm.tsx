"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { followLeader, type FollowActionState } from "@/lib/actions/follow";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Button } from "@/components/ui/Button";
import { Card, CardDivider } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/formatting";

const initialState: FollowActionState = {};
const PRESETS = [250, 500, 1000, 2500];

export function CopySetupForm({
  leaderId,
  leaderName,
  buyingPower,
  initialAllocation,
}: {
  leaderId: string;
  leaderName: string;
  buyingPower: number;
  initialAllocation?: number;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(followLeader, initialState);
  const [allocation, setAllocation] = useState(initialAllocation ? String(initialAllocation) : "");

  useEffect(() => {
    if (state.success) router.push(`/leader/${leaderId}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  const numericAllocation = Number(allocation) || 0;
  const sliderMax = Math.max(buyingPower, numericAllocation, 100);
  const percentOfBuyingPower = buyingPower ? Math.min(100, (numericAllocation / buyingPower) * 100) : 0;

  return (
    <Card>
      <div className="mb-1 flex items-baseline justify-between">
        <p className="text-[13px] font-medium text-ink-muted">Allocation</p>
        <p className="font-mono text-[15px] font-semibold tabular-nums text-ink">
          {allocation ? formatCurrency(numericAllocation) : "—"}
        </p>
      </div>
      <p className="mb-4 text-[12px] leading-relaxed text-ink-faint">
        The dollar amount you commit to mirroring {leaderName}&apos;s trades. Each of their orders is
        sized proportionally against this allocation — a trade that moves 5% of their equity moves
        roughly 5% of your allocation, capped at your available buying power.
      </p>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="leaderId" value={leaderId} />

        <div>
          <input
            type="range"
            min={0}
            max={sliderMax}
            step={10}
            value={numericAllocation}
            onChange={(e) => setAllocation(e.target.value)}
            className="w-full accent-emerald-signal"
          />
          <div className="mt-1 flex justify-between text-[11px] text-ink-faint">
            <span>{formatCurrency(0)}</span>
            <span>
              {buyingPower > 0 ? `${percentOfBuyingPower.toFixed(0)}% of buying power` : "No buying power available"}
            </span>
            <span>{formatCurrency(sliderMax)}</span>
          </div>
        </div>

        <CurrencyInput name="allocationAmount" value={allocation} onValueChange={setAllocation} />

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAllocation(String(preset))}
              className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:bg-white/[0.09] hover:text-ink"
            >
              {formatCurrency(preset)}
            </button>
          ))}
        </div>

        <CardDivider />

        <div className="space-y-1.5 text-[13px]">
          <div className="flex justify-between">
            <span className="text-ink-muted">Copy-trading subscription</span>
            <span className="font-mono text-ink">$15.00 / mo</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Per-trade commission</span>
            <span className="font-mono text-ink">$0.00</span>
          </div>
        </div>

        {state.error && <p className="text-sm text-rose-signal">{state.error}</p>}

        <Button type="submit" fullWidth size="lg" className="rounded-full" disabled={pending || !allocation}>
          {pending ? "Confirming…" : initialAllocation ? "Update allocation" : "Start copying"}
        </Button>
        <p className="text-center text-[11.5px] text-ink-faint">You can stop anytime.</p>
      </form>
    </Card>
  );
}

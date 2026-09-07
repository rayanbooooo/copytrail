"use client";

import { useActionState, useState } from "react";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Button } from "@/components/ui/Button";
import { CardDivider } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { submitSelfDirectedOrder, type TradeActionState } from "@/lib/actions/trading";
import { formatCurrency } from "@/lib/utils/formatting";

const initialState: TradeActionState = {};
const SIDES = ["Buy", "Sell"] as const;

interface OrderFormProps {
  symbol: string;
  buyingPower: number;
  price: number | null;
  initialSide?: "buy" | "sell";
}

export function OrderForm({ symbol, buyingPower, price, initialSide = "buy" }: OrderFormProps) {
  const [state, formAction, pending] = useActionState(submitSelfDirectedOrder, initialState);
  const [sideLabel, setSideLabel] = useState<(typeof SIDES)[number]>(initialSide === "buy" ? "Buy" : "Sell");
  const side = sideLabel === "Buy" ? "buy" : "sell";
  const [amount, setAmount] = useState("");
  const [previewing, setPreviewing] = useState(false);

  const numericAmount = Number(amount) || 0;
  const estShares = price && numericAmount ? numericAmount / price : null;

  return (
    <div className="space-y-4">
      <SegmentedControl options={SIDES} value={sideLabel} onChange={(v) => { setSideLabel(v); setPreviewing(false); }} />

      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-ink-muted">Buying power</span>
        <span className="font-mono text-[15px] font-medium text-ink">{formatCurrency(buyingPower)}</span>
      </div>

      <CardDivider />

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="symbol" value={symbol} />
        <input type="hidden" name="orderType" value="market" />
        <input type="hidden" name="side" value={side} />

        <CurrencyInput
          name="notionalAmount"
          value={amount}
          onValueChange={(v) => {
            setAmount(v);
            setPreviewing(false);
          }}
          placeholder="0.00"
          disabled={previewing}
        />

        {estShares !== null && (
          <p className="text-[12px] text-ink-faint">≈ {estShares.toFixed(4)} shares at {formatCurrency(price!)}</p>
        )}

        <div className="flex items-center justify-between rounded-xl border border-hairline-soft bg-black/20 px-4 py-2.5 text-[12px] text-ink-muted">
          <span>Platform commission</span>
          <span className="font-mono text-ink">$1.00</span>
        </div>

        {state.error && <p className="text-sm text-rose-signal">{state.error}</p>}
        {state.success && <p className="text-sm text-emerald-signal">Order submitted.</p>}

        {previewing ? (
          <div className="space-y-3">
            <CardDivider />
            <div className="space-y-1.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-ink-muted">Order value</span>
                <span className="font-mono text-ink">{formatCurrency(numericAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Total with fee</span>
                <span className="font-mono text-ink">{formatCurrency(numericAmount + 1)}</span>
              </div>
            </div>
            <Button type="submit" fullWidth variant={side === "buy" ? "primary" : "danger"} disabled={pending}>
              {pending ? "Placing order…" : `Confirm ${side} order`}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            fullWidth
            variant={side === "buy" ? "primary" : "danger"}
            disabled={numericAmount <= 0}
            onClick={() => setPreviewing(true)}
          >
            Preview order
          </Button>
        )}
      </form>
    </div>
  );
}

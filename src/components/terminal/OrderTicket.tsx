"use client";

import { useActionState, useState } from "react";
import { submitSelfDirectedOrder, type TradeActionState } from "@/lib/actions/trading";
import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Card, CardDivider } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/formatting";

const initialState: TradeActionState = {};

export function OrderTicket({ symbol, buyingPower }: { symbol: string; buyingPower: number }) {
  const [state, formAction, pending] = useActionState(submitSelfDirectedOrder, initialState);
  const [amount, setAmount] = useState("");

  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-ink-muted">Buying power</span>
        <span className="font-mono text-[15px] font-medium text-ink">
          {formatCurrency(buyingPower)}
        </span>
      </div>

      <CardDivider className="my-4" />

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="symbol" value={symbol} />
        <input type="hidden" name="orderType" value="market" />

        <CurrencyInput
          name="notionalAmount"
          value={amount}
          onValueChange={setAmount}
          placeholder="0.00"
        />

        <div className="flex items-center justify-between rounded-xl border border-hairline-soft bg-black/20 px-4 py-2.5 text-[12px] text-ink-muted">
          <span>Platform commission</span>
          <span className="font-mono text-ink">$1.00</span>
        </div>

        {state.error && <p className="text-sm text-rose-signal">{state.error}</p>}
        {state.success && <p className="text-sm text-emerald-signal">Order submitted.</p>}

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="submit"
            name="side"
            value="buy"
            variant="primary"
            fullWidth
            disabled={pending}
          >
            Buy · Long
          </Button>
          <Button
            type="submit"
            name="side"
            value="sell"
            variant="danger"
            fullWidth
            disabled={pending}
          >
            Sell · Short
          </Button>
        </div>
      </form>
    </Card>
  );
}

"use client";

import { useActionState, useState } from "react";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Stepper } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { CardDivider } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { submitSelfDirectedOrder, type TradeActionState } from "@/lib/actions/trading";
import { formatCurrency } from "@/lib/utils/formatting";

const initialState: TradeActionState = {};
const SIDES = ["Buy", "Sell"] as const;
const ORDER_TYPES = ["Market", "Limit"] as const;

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
  const [orderTypeLabel, setOrderTypeLabel] = useState<(typeof ORDER_TYPES)[number]>("Market");
  const orderType = orderTypeLabel === "Market" ? "market" : "limit";
  const [amount, setAmount] = useState("");
  const [qty, setQty] = useState(1);
  const [limitPrice, setLimitPrice] = useState("");
  const [previewing, setPreviewing] = useState(false);

  const numericAmount = Number(amount) || 0;
  const numericLimitPrice = Number(limitPrice) || 0;
  const estShares = price && numericAmount ? numericAmount / price : null;
  const orderValue = orderType === "market" ? numericAmount : qty * numericLimitPrice;
  const canPreview = orderType === "market" ? numericAmount > 0 : qty > 0 && numericLimitPrice > 0;

  function resetPreview() {
    setPreviewing(false);
  }

  return (
    <div className="space-y-3">
      <SegmentedControl options={SIDES} value={sideLabel} onChange={(v) => { setSideLabel(v); resetPreview(); }} className="w-full" />
      <SegmentedControl options={ORDER_TYPES} value={orderTypeLabel} onChange={(v) => { setOrderTypeLabel(v); resetPreview(); }} className="w-full" />

      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-ink-muted">Buying power</span>
        <span className="font-mono text-[13px] font-medium tabular-nums text-ink">{formatCurrency(buyingPower)}</span>
      </div>

      <CardDivider />

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="symbol" value={symbol} />
        <input type="hidden" name="orderType" value={orderType} />
        <input type="hidden" name="side" value={side} />

        {orderType === "market" ? (
          <>
            <CurrencyInput
              name="notionalAmount"
              value={amount}
              onValueChange={(v) => {
                setAmount(v);
                resetPreview();
              }}
              placeholder="0.00"
              disabled={previewing}
            />
            {estShares !== null && (
              <p className="text-[12px] text-ink-faint">≈ {estShares.toFixed(4)} shares at {formatCurrency(price!)}</p>
            )}
          </>
        ) : (
          <>
            <div>
              <p className="mb-1.5 text-[11.5px] font-medium text-ink-muted">Quantity (shares)</p>
              <Stepper value={qty} onChange={(v) => { setQty(v); resetPreview(); }} min={1} />
              <input type="hidden" name="qty" value={qty} />
            </div>
            <div>
              <p className="mb-1.5 text-[11.5px] font-medium text-ink-muted">Limit price</p>
              <CurrencyInput
                name="limitPrice"
                value={limitPrice}
                onValueChange={(v) => {
                  setLimitPrice(v);
                  resetPreview();
                }}
                placeholder={price ? price.toFixed(2) : "0.00"}
                disabled={previewing}
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-between rounded border border-hairline-soft bg-black/20 px-3 py-2 text-[11.5px] text-ink-muted">
          <span>Platform commission</span>
          <span className="font-mono tabular-nums text-ink">$1.00</span>
        </div>

        {state.error && <p className="text-sm text-rose-signal">{state.error}</p>}
        {state.success && <p className="text-sm text-emerald-signal">Order submitted.</p>}

        {previewing ? (
          <div className="space-y-3">
            <CardDivider />
            <div className="space-y-1.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-ink-muted">Order value</span>
                <span className="font-mono tabular-nums text-ink">{formatCurrency(orderValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Total with fee</span>
                <span className="font-mono tabular-nums text-ink">{formatCurrency(orderValue + 1)}</span>
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
            disabled={!canPreview}
            onClick={() => setPreviewing(true)}
          >
            Preview order
          </Button>
        )}
      </form>
    </div>
  );
}

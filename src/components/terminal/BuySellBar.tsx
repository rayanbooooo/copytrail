"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { OrderForm } from "@/components/terminal/OrderForm";
import { formatCurrency } from "@/lib/utils/formatting";

export function BuySellBar({ symbol, buyingPower, price }: { symbol: string; buyingPower: number; price: number | null }) {
  const [open, setOpen] = useState<"buy" | "sell" | null>(null);

  return (
    <div className="lg:hidden">
      <div className="space-y-2.5">
        <Button variant="primary" fullWidth size="lg" onClick={() => setOpen("buy")}>
          Buy
        </Button>
        <Button variant="outline" fullWidth size="lg" onClick={() => setOpen("sell")}>
          Sell
        </Button>
      </div>

      <BottomSheet
        open={open !== null}
        onClose={() => setOpen(null)}
        title={`${open === "sell" ? "Sell" : "Buy"} ${symbol}`}
        subtitle={price ? formatCurrency(price) : undefined}
      >
        {open && <OrderForm symbol={symbol} buyingPower={buyingPower} price={price} initialSide={open} />}
      </BottomSheet>
    </div>
  );
}

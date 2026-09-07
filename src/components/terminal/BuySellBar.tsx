"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { OrderForm } from "@/components/terminal/OrderForm";

export function BuySellBar({ symbol, buyingPower, price }: { symbol: string; buyingPower: number; price: number | null }) {
  const [open, setOpen] = useState<"buy" | "sell" | null>(null);

  return (
    <div className="lg:hidden">
      <div className="grid grid-cols-2 gap-3">
        <Button variant="primary" fullWidth onClick={() => setOpen("buy")}>
          Buy · Long
        </Button>
        <Button variant="danger" fullWidth onClick={() => setOpen("sell")}>
          Sell · Short
        </Button>
      </div>

      <BottomSheet open={open !== null} onClose={() => setOpen(null)} title={`Trade ${symbol}`}>
        {open && <OrderForm symbol={symbol} buyingPower={buyingPower} price={price} initialSide={open} />}
      </BottomSheet>
    </div>
  );
}

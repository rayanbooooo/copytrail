"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { RecentActivity } from "@/components/home/RecentActivity";
import type { TradeRow } from "@/types/database";

/**
 * The bell surfaces real account activity (recent fills) rather than a
 * fabricated notifications feed — this app has no separate notifications
 * system, so reusing the same trades data the Home page already fetches is
 * the honest version of this affordance.
 */
export function NotificationsButton({ trades }: { trades: TradeRow[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Recent activity"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-ink active:scale-90 transition-transform"
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Recent activity">
        <RecentActivity trades={trades} />
      </BottomSheet>
    </>
  );
}

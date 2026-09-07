"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDownToLine, ArrowUpFromLine, Grid2x2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const actions = [
  { label: "Buy", icon: ArrowUpFromLine, href: "/trade/AAPL", accent: true },
  { label: "Sell", icon: ArrowDownToLine, href: "/trade/AAPL", accent: false },
  { label: "Deposit", icon: Wallet, href: "/onboarding/fund", accent: false },
  { label: "More", icon: Grid2x2, href: "/account", accent: false },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map(({ label, icon: Icon, href, accent }) => (
        <Link key={label} href={href} className="flex flex-col items-center gap-2">
          <motion.span
            whileTap={{ scale: 0.92 }}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              accent ? "bg-emerald-signal text-[#03130C]" : "bg-white/[0.07] text-ink",
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </motion.span>
          <span className="text-[11.5px] font-medium text-ink-muted">{label}</span>
        </Link>
      ))}
    </div>
  );
}

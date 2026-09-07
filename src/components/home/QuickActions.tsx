"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDownToLine, ArrowUpFromLine, MoreHorizontal, Wallet } from "lucide-react";

const actions = [
  { label: "Buy", icon: ArrowUpFromLine, href: "/trade/AAPL" },
  { label: "Sell", icon: ArrowDownToLine, href: "/trade/AAPL" },
  { label: "Deposit", icon: Wallet, href: "/onboarding/fund" },
  { label: "More", icon: MoreHorizontal, href: "/account" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map(({ label, icon: Icon, href }) => (
        <Link key={label} href={href}>
          <motion.div
            whileTap={{ scale: 0.94 }}
            className="flex flex-col items-center gap-2 rounded-2xl border border-hairline bg-surface py-3.5"
          >
            <Icon className="h-[19px] w-[19px] text-ink" strokeWidth={1.8} />
            <span className="text-[11.5px] font-medium text-ink-muted">{label}</span>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}

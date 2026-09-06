"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LineChart, Rows3, WalletMinimal } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const items: ReadonlyArray<{
  href: string;
  label: string;
  icon: typeof Rows3;
  matchPrefix?: string;
}> = [
  { href: "/feed", label: "Feed", icon: Rows3 },
  { href: "/trade/AAPL", label: "Trade", icon: LineChart, matchPrefix: "/trade" },
  { href: "/wallet", label: "Wallet", icon: WalletMinimal },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom sticky bottom-0 z-30 border-t border-white/[0.06] bg-[#090A0F]/90 backdrop-blur-xl2">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-1.5">
        {items.map(({ href, label, icon: Icon, matchPrefix }) => {
          const active = matchPrefix
            ? pathname.startsWith(matchPrefix)
            : pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 active:scale-[0.96] transition-transform"
            >
              <Icon
                className={cn("h-[22px] w-[22px]", active ? "text-emerald-signal" : "text-ink-faint")}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span
                className={cn(
                  "text-[10.5px] font-medium",
                  active ? "text-emerald-signal" : "text-ink-faint",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

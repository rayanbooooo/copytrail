"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Rows3, Trophy, UserRound } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const items: ReadonlyArray<{
  href: string;
  label: string;
  icon: typeof Home;
  matchPrefix?: string;
}> = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/markets", label: "Markets", icon: Rows3 },
  { href: "/trade/AAPL", label: "Trade", icon: LineChart, matchPrefix: "/trade" },
  { href: "/discover", label: "Discover", icon: Trophy, matchPrefix: "/discover" },
  { href: "/account", label: "Account", icon: UserRound, matchPrefix: "/account" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom sticky bottom-0 z-30 border-t border-white/[0.06] bg-black/90 backdrop-blur-xl2 lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2.5">
        {items.map(({ href, label, icon: Icon, matchPrefix }) => {
          const active = matchPrefix ? pathname.startsWith(matchPrefix) : pathname === href;
          return (
            <Link key={href} href={href} aria-label={label} className="active:scale-[0.94] transition-transform">
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  active && "bg-emerald-signal/15",
                )}
              >
                <Icon
                  className={cn("h-[21px] w-[21px]", active ? "text-emerald-signal" : "text-ink-faint")}
                  strokeWidth={active ? 2.2 : 1.8}
                />
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export { items as navItems };

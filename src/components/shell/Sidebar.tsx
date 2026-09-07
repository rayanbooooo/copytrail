"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { History, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { navItems } from "@/components/shell/BottomNav";
import { Avatar } from "@/components/ui/Avatar";

const secondaryItems = [
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/activity", label: "Activity", icon: History },
] as const;

export function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-10 hidden h-screen w-64 shrink-0 flex-col border-r border-white/[0.06] bg-black/70 px-4 py-6 backdrop-blur-xl lg:flex">
      <Link href="/home" className="mb-8 flex items-center gap-2.5 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] bg-gradient-to-br from-emerald-signal/25 to-transparent">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 9.5L5 5.5L8 8.5L13 2" stroke="#19E38C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-ink">CopyTrail</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon, matchPrefix }) => {
          const active = matchPrefix ? pathname.startsWith(matchPrefix) : pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                active ? "text-ink" : "text-ink-muted hover:text-ink",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-xl bg-white/[0.07]"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <Icon className="relative z-10 h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.8} />
              <span className="relative z-10">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="my-4 h-px bg-hairline-soft" />

      <nav className="flex flex-1 flex-col gap-1">
        {secondaryItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                active ? "text-ink" : "text-ink-faint hover:text-ink-muted",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      {userEmail && (
        <Link href="/account" className="flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-white/[0.04]">
          <Avatar name={userEmail} size={30} />
          <span className="truncate text-[13px] text-ink-muted">{userEmail}</span>
        </Link>
      )}
    </aside>
  );
}

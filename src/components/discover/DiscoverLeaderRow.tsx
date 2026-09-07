import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { formatPercent } from "@/lib/utils/formatting";
import type { LeaderCardData } from "@/types/domain";

export function DiscoverLeaderRow({ leader, isFollowing }: { leader: LeaderCardData; isFollowing: boolean }) {
  const positive = leader.total_return_30d >= 0;

  return (
    <div className="flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.02]">
      <Link href={`/leader/${leader.id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
        <Avatar name={leader.displayName} size={40} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13.5px] font-semibold leading-tight text-ink">{leader.displayName}</span>
            {leader.is_verified && (
              <Pill tone="emerald" className="gap-1 px-1 py-0">
                <ShieldCheck className="h-2.5 w-2.5" />
              </Pill>
            )}
            <span className={`font-mono text-[12.5px] font-semibold tabular-nums ${positive ? "text-emerald-signal" : "text-rose-signal"}`}>
              {formatPercent(leader.total_return_30d, { signed: true })}
            </span>
          </div>
          <p className="text-[11.5px] leading-tight text-ink-faint">{leader.copierCount.toLocaleString()} followers</p>
        </div>
      </Link>

      <Link href={`/leader/${leader.id}/copy`} className="shrink-0">
        <Button size="sm" variant={isFollowing ? "outline" : "primary"} className="rounded-full">
          {isFollowing ? "Managing" : "Copy"}
        </Button>
      </Link>
    </div>
  );
}

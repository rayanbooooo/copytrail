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
    <div className="flex items-center justify-between px-5 py-4">
      <Link href={`/leader/${leader.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar name={leader.displayName} size={40} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[14px] font-semibold text-ink">{leader.displayName}</span>
            {leader.is_verified && (
              <Pill tone="emerald" glow className="gap-1 px-1.5 py-0.5">
                <ShieldCheck className="h-3 w-3" />
              </Pill>
            )}
          </div>
          <p className="text-[12px] text-ink-faint">{leader.copierCount.toLocaleString()} followers</p>
        </div>
      </Link>

      <div className="flex shrink-0 items-center gap-3">
        <span className={`font-mono text-[14px] font-semibold ${positive ? "text-emerald-signal" : "text-rose-signal"}`}>
          {formatPercent(leader.total_return_30d, { signed: true })}
        </span>
        <Link href={`/leader/${leader.id}/copy`}>
          <Button size="sm" variant={isFollowing ? "outline" : "primary"}>
            {isFollowing ? "Managing" : "Copy"}
          </Button>
        </Link>
      </div>
    </div>
  );
}

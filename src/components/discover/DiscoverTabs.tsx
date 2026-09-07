"use client";

import { useMemo, useState } from "react";
import { FilterChips } from "@/components/ui/FilterChip";
import { DiscoverLeaderRow } from "@/components/discover/DiscoverLeaderRow";
import type { LeaderCardData } from "@/types/domain";

const TABS = ["Top Traders", "Popular", "Following"] as const;

export function DiscoverTabs({
  leaders,
  followedLeaderIds,
}: {
  leaders: LeaderCardData[];
  followedLeaderIds: Set<string>;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Top Traders");

  const sorted = useMemo(() => {
    if (tab === "Popular") return [...leaders].sort((a, b) => b.copierCount - a.copierCount);
    if (tab === "Following") return leaders.filter((l) => followedLeaderIds.has(l.id));
    return [...leaders].sort((a, b) => b.total_return_30d - a.total_return_30d);
  }, [leaders, tab, followedLeaderIds]);

  return (
    <div className="space-y-4">
      <FilterChips options={TABS} value={tab} onChange={setTab} />

      <div>
        <h2 className="mb-1 text-[13px] font-semibold text-ink">Top Performers</h2>
        {sorted.length === 0 ? (
          <p className="px-1 py-6 text-center text-[13px] text-ink-muted">
            {tab === "Following" ? "You're not copying anyone yet." : "No leaders yet — check back soon."}
          </p>
        ) : (
          <div className="divide-y divide-hairline-soft">
            {sorted.map((leader) => (
              <DiscoverLeaderRow key={leader.id} leader={leader} isFollowing={followedLeaderIds.has(leader.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

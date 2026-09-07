"use client";

import { useMemo, useState } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Card, CardDivider } from "@/components/ui/Card";
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
      <SegmentedControl options={TABS} value={tab} onChange={setTab} className="w-full" />

      <Card className="p-0">
        {sorted.length === 0 ? (
          <p className="px-5 py-6 text-center text-[13px] text-ink-muted">
            {tab === "Following" ? "You're not copying anyone yet." : "No leaders yet — check back soon."}
          </p>
        ) : (
          sorted.map((leader, i) => (
            <div key={leader.id}>
              {i > 0 && <CardDivider />}
              <DiscoverLeaderRow leader={leader} isFollowing={followedLeaderIds.has(leader.id)} />
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

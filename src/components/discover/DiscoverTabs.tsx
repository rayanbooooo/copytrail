"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FilterChips } from "@/components/ui/FilterChip";
import { DiscoverLeaderRow } from "@/components/discover/DiscoverLeaderRow";
import { fadeInUp, staggerContainer } from "@/lib/motion/variants";
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
        <h2 className="mb-1 text-[13px] font-semibold text-ink lg:text-[15px]">Top Performers</h2>
        {sorted.length === 0 ? (
          <p className="px-1 py-6 text-center text-[13px] text-ink-muted">
            {tab === "Following" ? "You're not copying anyone yet." : "No leaders yet — check back soon."}
          </p>
        ) : (
          <motion.div
            key={tab}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="divide-y divide-hairline-soft lg:grid lg:grid-cols-2 lg:gap-3 lg:divide-y-0 xl:grid-cols-3"
          >
            {sorted.map((leader) => (
              <motion.div key={leader.id} variants={fadeInUp}>
                <DiscoverLeaderRow leader={leader} isFollowing={followedLeaderIds.has(leader.id)} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

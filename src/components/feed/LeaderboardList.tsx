"use client";

import { motion } from "framer-motion";
import { LeaderCard } from "@/components/feed/LeaderCard";
import { staggerContainer, fadeInUp } from "@/lib/motion/variants";
import type { LeaderCardData } from "@/types/domain";

export function LeaderboardList({
  leaders,
  followedLeaderIds,
}: {
  leaders: LeaderCardData[];
  followedLeaderIds: Set<string>;
}) {
  if (leaders.length === 0) {
    return (
      <p className="mt-10 text-center text-sm text-ink-muted">
        No leaders yet — check back soon.
      </p>
    );
  }

  return (
    <motion.div
      className="space-y-3"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {leaders.map((leader) => (
        <motion.div key={leader.id} variants={fadeInUp}>
          <LeaderCard leader={leader} isFollowing={followedLeaderIds.has(leader.id)} />
        </motion.div>
      ))}
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Pill";
import { Stat, StatDivider } from "@/components/ui/Stat";
import { Button } from "@/components/ui/Button";
import { FollowModal } from "@/components/feed/FollowModal";
import { formatPercent } from "@/lib/utils/formatting";
import type { LeaderCardData } from "@/types/domain";

export function LeaderCard({
  leader,
  isFollowing,
}: {
  leader: LeaderCardData;
  isFollowing: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const positive = leader.total_return_30d >= 0;

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <Card className="group hover:border-emerald-500/30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Avatar name={leader.displayName} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-semibold text-ink">{leader.displayName}</span>
                  {leader.is_verified && (
                    <Pill tone="emerald" glow className="gap-1 px-1.5 py-0.5">
                      <ShieldCheck className="h-3 w-3" />
                      Pro
                    </Pill>
                  )}
                </div>
                <p className="mt-0.5 text-[13px] text-ink-muted">
                  {leader.strategy_tags.join(" • ")}
                </p>
              </div>
            </div>
            <span
              className={`font-mono text-[17px] font-semibold tracking-tight ${
                positive ? "text-emerald-signal" : "text-rose-signal"
              }`}
            >
              {formatPercent(leader.total_return_30d, { signed: true })}
            </span>
          </div>

          <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
            {leader.bio}
          </p>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-hairline-soft bg-black/20 px-4 py-3">
            <Stat label="Win rate" value={`${leader.win_rate.toFixed(1)}%`} />
            <StatDivider />
            <Stat label="Risk" value={`${leader.risk_score}/10`} />
            <StatDivider />
            <Stat label="Copiers" value={String(leader.copierCount)} />
          </div>

          <Button
            fullWidth
            className="mt-4"
            variant={isFollowing ? "outline" : "primary"}
            onClick={() => setModalOpen(true)}
          >
            {isFollowing ? "Manage allocation" : "Copy this trader"}
          </Button>
        </Card>
      </motion.div>

      <FollowModal
        leader={leader}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

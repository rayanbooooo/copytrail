import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getFollowForUser, getLeaderById } from "@/lib/db/queries";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { formatPercent } from "@/lib/utils/formatting";

export default async function TraderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [leader, existingFollow, { data: counts }] = await Promise.all([
    getLeaderById(supabase, id),
    user ? getFollowForUser(supabase, user.id, id) : Promise.resolve(null),
    supabase.from("leader_copier_counts").select("*").eq("leader_id", id).maybeSingle(),
  ]);

  if (!leader) notFound();

  const copierCount = counts?.active_copier_count ?? 0;
  const positive = leader.total_return_30d >= 0;
  const isFollowing = existingFollow?.status === "active";

  return (
    <div className="space-y-4">
      <div className="-mx-4 -mt-4 h-24 bg-gradient-to-br from-emerald-signal/20 via-surface to-base lg:mx-0 lg:mt-0 lg:rounded-lg" />

      <div className="-mt-10 flex items-end justify-between px-1">
        <div className="flex items-end gap-3">
          <Avatar name={leader.displayName} size={72} className="border-4 border-base" />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-[17px] font-semibold tracking-tight text-ink">{leader.displayName}</h1>
          {leader.is_verified && (
            <Pill tone="emerald" className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              Verified Pro
            </Pill>
          )}
        </div>
        <p className="mt-0.5 text-[13px] text-ink-muted">{leader.strategy_tags.join(" • ")}</p>
        <p className="mt-1 text-[13px] text-ink-faint">
          {copierCount.toLocaleString()} followers ·{" "}
          <span className={positive ? "text-emerald-signal" : "text-rose-signal"}>
            {formatPercent(leader.total_return_30d, { signed: true })} (30d)
          </span>
        </p>
      </div>

      <Link href={`/leader/${leader.id}/copy`}>
        <Button fullWidth variant={isFollowing ? "outline" : "primary"}>
          {isFollowing ? "Manage allocation" : "Copy this trader"}
        </Button>
      </Link>

      <Card>
        <div className="flex items-center justify-between">
          <Stat label="Win rate" value={`${leader.win_rate.toFixed(1)}%`} />
          <Stat label="Risk score" value={`${leader.risk_score}/10`} align="center" />
          <Stat label="Followers" value={copierCount.toLocaleString()} align="center" />
        </div>
      </Card>

      <Card>
        <h3 className="mb-1.5 text-[13px] font-semibold uppercase tracking-wide text-ink-faint">About</h3>
        <p className="text-[13px] leading-relaxed text-ink-muted">{leader.bio}</p>
      </Card>
    </div>
  );
}

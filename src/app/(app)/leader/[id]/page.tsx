import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getFollowForUser, getLeaderById, getLeaderTradeCount } from "@/lib/db/queries";
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

  const tradeCount = await getLeaderTradeCount(supabase, leader.profile_id);

  const copierCount = counts?.active_copier_count ?? 0;
  const positive = leader.total_return_30d >= 0;
  const isFollowing = existingFollow?.status === "active";

  return (
    <div className="space-y-4">
      <div className="-mx-4 -mt-4 h-28 bg-gradient-to-br from-emerald-signal/25 via-surface to-black lg:mx-0 lg:mt-0 lg:rounded-xl2" />

      <div className="-mt-12 px-1">
        <Avatar name={leader.displayName} size={76} className="border-4 border-black" />
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-[19px] font-semibold tracking-tight text-ink">{leader.displayName}</h1>
          {leader.is_verified && (
            <Pill tone="emerald" className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </Pill>
          )}
        </div>
        <p className="mt-0.5 text-[13px] text-ink-muted">{leader.strategy_tags.join(" • ")}</p>
        <p className="mt-1 text-[13px] text-ink-faint">
          {copierCount.toLocaleString()} followers ·{" "}
          <span className={positive ? "text-emerald-signal" : "text-rose-signal"}>
            {formatPercent(leader.total_return_30d, { signed: true })} YTD
          </span>
        </p>
      </div>

      <Link href={`/leader/${leader.id}/copy`}>
        <Button fullWidth size="lg" className="rounded-full" variant={isFollowing ? "outline" : "primary"}>
          {isFollowing ? "Manage allocation" : "Copy this trader"}
        </Button>
      </Link>

      <Card>
        <div className="flex items-center justify-between">
          <Stat label="Total trades" value={tradeCount.toLocaleString()} />
          <Stat label="Win rate" value={`${leader.win_rate.toFixed(1)}%`} align="center" />
          <Stat label="Risk score" value={`${leader.risk_score}/10`} align="center" />
        </div>
      </Card>

      <Card>
        <h3 className="mb-1.5 text-[13px] font-semibold uppercase tracking-wide text-ink-faint">About</h3>
        <p className="text-[13px] leading-relaxed text-ink-muted">{leader.bio}</p>
      </Card>
    </div>
  );
}

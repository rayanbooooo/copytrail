import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAggregateCopyPoolReturn, getLeaderboard } from "@/lib/db/queries";
import { HeroStatsBlock } from "@/components/feed/HeroStatsBlock";
import { LeaderboardList } from "@/components/feed/LeaderboardList";

export default async function FeedPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [leaders, aggregateReturn, followsResult] = await Promise.all([
    getLeaderboard(supabase),
    getAggregateCopyPoolReturn(supabase),
    user
      ? supabase.from("follows").select("leader_id").eq("follower_id", user.id).eq("status", "active")
      : Promise.resolve({ data: [] as { leader_id: string }[] }),
  ]);

  const followedLeaderIds = new Set((followsResult.data ?? []).map((f) => f.leader_id));

  return (
    <div className="space-y-6">
      <HeroStatsBlock aggregateReturn30d={aggregateReturn} activeLeaders={leaders.length} />

      <div>
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-faint">
          Leaderboard
        </h2>
        <LeaderboardList leaders={leaders} followedLeaderIds={followedLeaderIds} />
      </div>
    </div>
  );
}

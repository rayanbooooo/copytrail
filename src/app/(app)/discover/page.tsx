import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAggregateCopyPoolReturn, getLeaderboard } from "@/lib/db/queries";
import { HeroStatsBlock } from "@/components/discover/HeroStatsBlock";
import { DiscoverTabs } from "@/components/discover/DiscoverTabs";

export default async function DiscoverPage() {
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
      <div>
        <h1 className="mb-4 text-xl font-semibold tracking-tight text-ink">Discover</h1>
        <HeroStatsBlock aggregateReturn30d={aggregateReturn} activeLeaders={leaders.length} />
      </div>
      <DiscoverTabs leaders={leaders} followedLeaderIds={followedLeaderIds} />
    </div>
  );
}

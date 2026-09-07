import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLeaderboard } from "@/lib/db/queries";
import { DiscoverTabs } from "@/components/discover/DiscoverTabs";

export default async function DiscoverPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [leaders, followsResult] = await Promise.all([
    getLeaderboard(supabase),
    user
      ? supabase.from("follows").select("leader_id").eq("follower_id", user.id).eq("status", "active")
      : Promise.resolve({ data: [] as { leader_id: string }[] }),
  ]);

  const followedLeaderIds = new Set((followsResult.data ?? []).map((f) => f.leader_id));

  return (
    <div className="space-y-4">
      <h1 className="text-[19px] font-semibold tracking-tight text-ink">Discover</h1>
      <DiscoverTabs leaders={leaders} followedLeaderIds={followedLeaderIds} />
    </div>
  );
}

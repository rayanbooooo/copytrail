import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getRecentTrades } from "@/lib/db/queries";
import { ActivityList } from "@/components/activity/ActivityList";

export default async function ActivityPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const trades = await getRecentTrades(supabase, user.id, 50);

  return (
    <div className="space-y-4">
      <h1 className="text-[19px] font-semibold tracking-tight text-ink">Activity</h1>
      <ActivityList trades={trades} />
    </div>
  );
}

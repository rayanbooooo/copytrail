import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getFollowForUser, getLeaderById } from "@/lib/db/queries";
import { Avatar } from "@/components/ui/Avatar";
import { CopySetupForm } from "@/components/discover/CopySetupForm";

export default async function CopySetupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const leader = await getLeaderById(supabase, id);
  if (!leader) notFound();

  const existingFollow = user ? await getFollowForUser(supabase, user.id, id) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Avatar name={leader.displayName} size={48} />
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-ink">Copy {leader.displayName}</h1>
          <p className="text-[13px] text-ink-muted">{leader.strategy_tags.join(" • ")}</p>
        </div>
      </div>

      <CopySetupForm
        leaderId={leader.id}
        leaderName={leader.displayName}
        initialAllocation={existingFollow?.allocation_amount}
      />
    </div>
  );
}

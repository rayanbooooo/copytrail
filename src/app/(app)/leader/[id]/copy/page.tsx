import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getFollowForUser, getLeaderById, getWallet } from "@/lib/db/queries";
import { Avatar } from "@/components/ui/Avatar";
import { formatPercent } from "@/lib/utils/formatting";
import { CopySetupForm } from "@/components/discover/CopySetupForm";

export default async function CopySetupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [leader, { data: counts }] = await Promise.all([
    getLeaderById(supabase, id),
    supabase.from("leader_copier_counts").select("*").eq("leader_id", id).maybeSingle(),
  ]);
  if (!leader) notFound();

  const [existingFollow, wallet] = await Promise.all([
    user ? getFollowForUser(supabase, user.id, id) : Promise.resolve(null),
    user ? getWallet(supabase, user.id) : Promise.resolve(null),
  ]);

  const copierCount = counts?.active_copier_count ?? 0;
  const positive = leader.total_return_30d >= 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Avatar name={leader.displayName} size={48} />
        <div>
          <h1 className="text-[16px] font-semibold tracking-tight text-ink">{leader.displayName}</h1>
          <p className="text-[12.5px] text-ink-faint">
            <span className={positive ? "text-emerald-signal" : "text-rose-signal"}>
              {formatPercent(leader.total_return_30d, { signed: true })} YTD
            </span>{" "}
            · {copierCount.toLocaleString()} followers
          </p>
        </div>
      </div>

      <CopySetupForm
        leaderId={leader.id}
        leaderName={leader.displayName}
        buyingPower={wallet?.cash_balance ?? 0}
        initialAllocation={existingFollow?.allocation_amount}
      />
    </div>
  );
}

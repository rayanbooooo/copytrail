"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { followAllocationSchema } from "@/lib/validation/schemas";

export interface FollowActionState {
  error?: string;
  success?: boolean;
}

export async function followLeader(
  _prevState: FollowActionState,
  formData: FormData,
): Promise<FollowActionState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You need to be signed in to follow a trader." };

  const parsed = followAllocationSchema.safeParse({
    leaderId: formData.get("leaderId"),
    allocationAmount: formData.get("allocationAmount"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid allocation." };
  }

  const { error } = await supabase.from("follows").upsert(
    {
      follower_id: user.id,
      leader_id: parsed.data.leaderId,
      allocation_amount: parsed.data.allocationAmount,
      status: "active",
    },
    { onConflict: "follower_id,leader_id" },
  );

  if (error) return { error: error.message };

  revalidatePath("/feed");
  revalidatePath("/wallet");
  return { success: true };
}

export async function pauseFollow(followId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("follows")
    .update({ status: "paused" })
    .eq("id", followId)
    .eq("follower_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/wallet");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function toggleWatchlist(symbol: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const upperSymbol = symbol.toUpperCase();

  const { data: existing } = await supabase
    .from("watchlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("symbol", upperSymbol)
    .maybeSingle();

  if (existing) {
    await supabase.from("watchlist_items").delete().eq("id", existing.id);
  } else {
    await supabase.from("watchlist_items").insert({ user_id: user.id, symbol: upperSymbol });
  }

  revalidatePath("/watchlist");
  revalidatePath(`/trade/${upperSymbol}`);
  return { watching: !existing };
}

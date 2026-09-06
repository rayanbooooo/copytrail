import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getAccountSnapshot } from "@/lib/alpaca/accounts";
import { isAlpacaConfigured } from "@/lib/config/env";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isAlpacaConfigured()) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }

  const admin = createAdminSupabaseClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("alpaca_account_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.alpaca_account_id) {
    return NextResponse.json({ configured: true, onboarded: false }, { status: 200 });
  }

  try {
    const snapshot = await getAccountSnapshot(profile.alpaca_account_id);
    return NextResponse.json({ configured: true, onboarded: true, snapshot });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load account" },
      { status: 502 },
    );
  }
}

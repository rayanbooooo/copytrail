import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createLinkToken } from "@/lib/plaid/link";
import { isPlaidConfigured } from "@/lib/config/env";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isPlaidConfigured()) {
    return NextResponse.json({ error: "Plaid is not configured." }, { status: 501 });
  }

  try {
    const linkToken = await createLinkToken(user.id);
    return NextResponse.json({ linkToken });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create link token" },
      { status: 502 },
    );
  }
}

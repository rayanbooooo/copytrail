import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createAlpacaProcessorToken, exchangePublicToken } from "@/lib/plaid/exchange";
import { createAchRelationship } from "@/lib/alpaca/funding";
import { isAlpacaConfigured, isPlaidConfigured } from "@/lib/config/env";

const bodySchema = z.object({
  publicToken: z.string().min(1),
  plaidAccountId: z.string().min(1),
});

/**
 * Exchanges a Plaid public token for an Alpaca ACH relationship, without
 * triggering a transfer. The Wallet screen's deposit flow calls
 * linkBankAndFund (a server action) for the combined link+fund path; this
 * route exists for a "link now, fund later" UX (Linked Accounts module).
 */
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isPlaidConfigured() || !isAlpacaConfigured()) {
    return NextResponse.json({ error: "Bank linking is not configured." }, { status: 501 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("alpaca_account_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.alpaca_account_id) {
    return NextResponse.json(
      { error: "Complete brokerage onboarding before linking a bank." },
      { status: 409 },
    );
  }

  try {
    const accessToken = await exchangePublicToken(parsed.data.publicToken);
    const processorToken = await createAlpacaProcessorToken(
      accessToken,
      parsed.data.plaidAccountId,
    );
    const relationship = await createAchRelationship(profile.alpaca_account_id, processorToken);
    return NextResponse.json({ relationship });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to link bank account" },
      { status: 502 },
    );
  }
}

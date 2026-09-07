"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createBrokerageAccount } from "@/lib/alpaca/accounts";
import { createAchRelationship, createTransfer } from "@/lib/alpaca/funding";
import { createAlpacaProcessorToken, exchangePublicToken } from "@/lib/plaid/exchange";
import { isAlpacaConfigured, isPlaidConfigured } from "@/lib/config/env";
import { kycOnboardingSchema, fundingSchema } from "@/lib/validation/schemas";

export interface OnboardingActionState {
  error?: string;
  success?: boolean;
}

export async function createAlpacaAccount(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to continue." };

  if (!isAlpacaConfigured()) {
    return {
      error: "Alpaca isn't connected yet. Add ALPACA_BROKER_API_KEY_ID/SECRET to enable onboarding.",
    };
  }

  const parsed = kycOnboardingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid onboarding details." };
  }

  const headerList = await headers();
  const ipAddress = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";

  try {
    const account = await createBrokerageAccount({
      contact: {
        emailAddress: user.email!,
        phoneNumber: "+10000000000",
        streetAddress: [parsed.data.streetAddress],
        city: parsed.data.city,
        state: parsed.data.state,
        postalCode: parsed.data.postalCode,
        country: "USA",
      },
      identity: {
        givenName: parsed.data.legalFirstName,
        familyName: parsed.data.legalLastName,
        dateOfBirth: parsed.data.dateOfBirth,
        taxId: `***-**-${parsed.data.ssnLast4}`,
        taxIdType: "USA_SSN",
        countryOfCitizenship: parsed.data.countryOfCitizenship,
        countryOfBirth: parsed.data.countryOfCitizenship,
        countryOfTaxResidence: parsed.data.countryOfCitizenship,
        fundingSource: ["employment_income"],
      },
      disclosures: {
        isControlPerson: false,
        isAffiliatedExchangeOrFinra: false,
        isPoliticallyExposed: false,
        immediateFamilyExposed: false,
      },
      agreements: [
        { agreement: "customer_agreement", signedAt: new Date().toISOString(), ipAddress },
      ],
    });

    const admin = createAdminSupabaseClient();
    await admin
      .from("profiles")
      .update({ alpaca_account_id: account.id, kyc_status: "pending" })
      .eq("id", user.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Account creation failed." };
  }

  revalidatePath("/onboarding/fund");
  revalidatePath("/account");
  return { success: true };
}

export async function linkBankAndFund(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to continue." };

  if (!isPlaidConfigured() || !isAlpacaConfigured()) {
    return { error: "Bank linking isn't connected yet." };
  }

  const admin = createAdminSupabaseClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("alpaca_account_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.alpaca_account_id) {
    return { error: "Complete brokerage onboarding before funding your account." };
  }

  const publicToken = formData.get("publicToken");
  const plaidAccountId = formData.get("plaidAccountId");
  const parsed = fundingSchema.safeParse({
    achRelationshipId: "pending", // resolved below once the relationship is created
    amount: formData.get("amount"),
  });

  if (typeof publicToken !== "string" || typeof plaidAccountId !== "string") {
    return { error: "Missing Plaid link data." };
  }
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid funding amount." };
  }

  try {
    const accessToken = await exchangePublicToken(publicToken);
    const processorToken = await createAlpacaProcessorToken(accessToken, plaidAccountId);
    const relationship = await createAchRelationship(profile.alpaca_account_id, processorToken);
    await createTransfer(profile.alpaca_account_id, relationship.id, parsed.data.amount);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Funding failed." };
  }

  revalidatePath("/account");
  revalidatePath("/home");
  return { success: true };
}

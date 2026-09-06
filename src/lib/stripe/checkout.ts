import "server-only";
import { getStripeClient } from "@/lib/stripe/client";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getEnv } from "@/lib/config/env";

/**
 * Creates (or reuses) a Stripe customer for the user, then starts a
 * subscription Checkout Session for the $15/mo copy-trading plan.
 */
export async function createSubscriptionCheckoutSession(
  userId: string,
  userEmail: string,
): Promise<string> {
  const stripe = getStripeClient();
  const env = getEnv();
  const admin = createAdminSupabaseClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();

  let customerId = profile?.stripe_customer_id ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { supabase_user_id: userId },
    });
    customerId = customer.id;
    await admin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", userId);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: env.STRIPE_PRICE_ID_COPY_SUBSCRIPTION, quantity: 1 }],
    success_url: `${env.NEXT_PUBLIC_SITE_URL}/wallet?checkout=success`,
    cancel_url: `${env.NEXT_PUBLIC_SITE_URL}/wallet?checkout=canceled`,
    metadata: { supabase_user_id: userId },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  return session.url;
}

export async function createBillingPortalSession(customerId: string): Promise<string> {
  const stripe = getStripeClient();
  const env = getEnv();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.NEXT_PUBLIC_SITE_URL}/wallet`,
  });

  return session.url;
}

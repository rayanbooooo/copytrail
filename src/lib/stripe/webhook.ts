import "server-only";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";
import { getEnv } from "@/lib/config/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { SubscriptionStatus } from "@/types/database";

export function constructStripeEvent(rawBody: string, signature: string | null): Stripe.Event {
  const stripe = getStripeClient();
  const env = getEnv();
  if (!signature) throw new Error("Missing Stripe-Signature header");
  return stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    default:
      return "canceled";
  }
}

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  const admin = createAdminSupabaseClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      if (!userId || !session.subscription) return;

      const stripe = getStripeClient();
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      await syncSubscription(admin, userId, subscription);
      return;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      const resolvedUserId = userId ?? (await resolveUserIdByCustomer(admin, subscription.customer as string));
      if (!resolvedUserId) return;
      await syncSubscription(admin, resolvedUserId, subscription);
      return;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const userId = await resolveUserIdByCustomer(admin, customerId);
      if (!userId) return;

      await admin
        .from("subscriptions")
        .update({ status: "past_due" })
        .eq("user_id", userId);
      await admin.from("profiles").update({ subscription_active: false }).eq("id", userId);
      return;
    }

    default:
      return;
  }
}

async function resolveUserIdByCustomer(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  customerId: string,
): Promise<string | null> {
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.id ?? null;
}

async function syncSubscription(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  userId: string,
  subscription: Stripe.Subscription,
): Promise<void> {
  const status = mapStripeStatus(subscription.status);
  const nextBillingDate = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      amount: 15.0,
      status,
      next_billing_date: nextBillingDate,
    },
    { onConflict: "stripe_subscription_id" },
  );

  await admin
    .from("profiles")
    .update({
      subscription_active: status === "active",
      subscription_renews_at: nextBillingDate,
    })
    .eq("id", userId);
}

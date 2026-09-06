import { NextResponse } from "next/server";
import { constructStripeEvent, handleStripeEvent } from "@/lib/stripe/webhook";
import { isStripeConfigured } from "@/lib/config/env";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 501 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  try {
    const event = constructStripeEvent(rawBody, signature);
    await handleStripeEvent(event);
    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook verification failed" },
      { status: 400 },
    );
  }
}

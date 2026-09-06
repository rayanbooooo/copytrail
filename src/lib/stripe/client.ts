import "server-only";
import Stripe from "stripe";
import { getEnv, isStripeConfigured } from "@/lib/config/env";

export class StripeNotConfiguredError extends Error {
  constructor() {
    super("Stripe is not configured.");
    this.name = "StripeNotConfiguredError";
  }
}

let cachedClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!isStripeConfigured()) throw new StripeNotConfiguredError();
  if (cachedClient) return cachedClient;

  const env = getEnv();
  cachedClient = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia",
  });
  return cachedClient;
}

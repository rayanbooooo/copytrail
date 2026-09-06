import "server-only";
import { z } from "zod";

/**
 * Centralized, validated access to environment configuration.
 *
 * Alpaca/Plaid/Stripe keys are optional at the schema level because this app
 * must build and run (with visible "not configured" UI states) before real
 * broker/bank/billing credentials exist. Each isXConfigured() helper is the
 * single source of truth callers use to decide whether to hit the real API
 * or render a ConfigMissingBanner.
 */
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  ALPACA_ENV: z.enum(["sandbox", "live"]).default("sandbox"),
  ALPACA_BROKER_API_KEY_ID: z.string().optional().default(""),
  ALPACA_BROKER_API_SECRET: z.string().optional().default(""),
  ALPACA_BROKER_BASE_URL_SANDBOX: z
    .string()
    .url()
    .default("https://broker-api.sandbox.alpaca.markets"),
  ALPACA_BROKER_BASE_URL_LIVE: z.string().url().default("https://broker-api.alpaca.markets"),
  ALPACA_MARKET_DATA_API_KEY_ID: z.string().optional().default(""),
  ALPACA_MARKET_DATA_API_SECRET: z.string().optional().default(""),
  ALPACA_WEBHOOK_SECRET: z.string().optional().default(""),

  PLAID_CLIENT_ID: z.string().optional().default(""),
  PLAID_SECRET: z.string().optional().default(""),
  PLAID_ENV: z.enum(["sandbox", "development", "production"]).default("sandbox"),

  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
  STRIPE_PRICE_ID_COPY_SUBSCRIPTION: z.string().optional().default(""),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional().default(""),

  CRON_SECRET: z.string().optional().default(""),

  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration: ${parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`,
    );
  }
  cached = parsed.data;
  return cached;
}

export function isAlpacaConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.ALPACA_BROKER_API_KEY_ID && env.ALPACA_BROKER_API_SECRET);
}

export function isAlpacaMarketDataConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.ALPACA_MARKET_DATA_API_KEY_ID && env.ALPACA_MARKET_DATA_API_SECRET);
}

export function isPlaidConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.PLAID_CLIENT_ID && env.PLAID_SECRET);
}

export function isStripeConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_ID_COPY_SUBSCRIPTION);
}

export function alpacaBrokerBaseUrl(): string {
  const env = getEnv();
  return env.ALPACA_ENV === "live"
    ? env.ALPACA_BROKER_BASE_URL_LIVE
    : env.ALPACA_BROKER_BASE_URL_SANDBOX;
}

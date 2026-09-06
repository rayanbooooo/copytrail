import "server-only";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { getEnv, isPlaidConfigured } from "@/lib/config/env";

export class PlaidNotConfiguredError extends Error {
  constructor() {
    super("Plaid credentials are not configured.");
    this.name = "PlaidNotConfiguredError";
  }
}

let cachedClient: PlaidApi | null = null;

export function getPlaidClient(): PlaidApi {
  if (!isPlaidConfigured()) throw new PlaidNotConfiguredError();
  if (cachedClient) return cachedClient;

  const env = getEnv();
  const configuration = new Configuration({
    basePath: PlaidEnvironments[env.PLAID_ENV],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": env.PLAID_CLIENT_ID,
        "PLAID-SECRET": env.PLAID_SECRET,
      },
    },
  });

  cachedClient = new PlaidApi(configuration);
  return cachedClient;
}

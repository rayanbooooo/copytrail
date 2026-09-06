import "server-only";
import { getEnv, alpacaBrokerBaseUrl, isAlpacaConfigured } from "@/lib/config/env";

export class AlpacaNotConfiguredError extends Error {
  constructor() {
    super("Alpaca Broker API credentials are not configured.");
    this.name = "AlpacaNotConfiguredError";
  }
}

export class AlpacaApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`Alpaca API error (${status}): ${JSON.stringify(body)}`);
    this.name = "AlpacaApiError";
  }
}

/**
 * Minimal typed fetch wrapper for the Alpaca Broker API. There is no
 * maintained official Node SDK for the Broker API (as opposed to the
 * Trading API), so we hand-roll requests here rather than depend on an
 * unmaintained community package.
 */
export async function alpacaBrokerRequest<T>(
  path: string,
  init?: RequestInit & { query?: Record<string, string | number | undefined> },
): Promise<T> {
  if (!isAlpacaConfigured()) {
    throw new AlpacaNotConfiguredError();
  }

  const env = getEnv();
  const baseUrl = alpacaBrokerBaseUrl();
  const url = new URL(path, baseUrl);

  if (init?.query) {
    for (const [key, value] of Object.entries(init.query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const basicAuth = Buffer.from(
    `${env.ALPACA_BROKER_API_KEY_ID}:${env.ALPACA_BROKER_API_SECRET}`,
  ).toString("base64");

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${basicAuth}`,
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new AlpacaApiError(response.status, body);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

import "server-only";
import { ProcessorTokenCreateRequestProcessorEnum } from "plaid";
import { getPlaidClient } from "@/lib/plaid/client";

export async function exchangePublicToken(publicToken: string): Promise<string> {
  const client = getPlaidClient();
  const response = await client.itemPublicTokenExchange({ public_token: publicToken });
  return response.data.access_token;
}

/**
 * Creates a Plaid processor token scoped to Alpaca, which is what Alpaca's
 * ACH relationship endpoint expects instead of a raw account/routing number.
 */
export async function createAlpacaProcessorToken(
  accessToken: string,
  accountId: string,
): Promise<string> {
  const client = getPlaidClient();
  const response = await client.processorTokenCreate({
    access_token: accessToken,
    account_id: accountId,
    processor: ProcessorTokenCreateRequestProcessorEnum.Alpaca,
  });
  return response.data.processor_token;
}

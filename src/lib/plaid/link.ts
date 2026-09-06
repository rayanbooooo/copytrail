import "server-only";
import { CountryCode, Products } from "plaid";
import { getPlaidClient } from "@/lib/plaid/client";

export async function createLinkToken(userId: string): Promise<string> {
  const client = getPlaidClient();
  const response = await client.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: "CopyTrail",
    products: [Products.Auth],
    country_codes: [CountryCode.Us],
    language: "en",
  });
  return response.data.link_token;
}

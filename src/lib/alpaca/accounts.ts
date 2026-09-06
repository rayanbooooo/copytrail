import "server-only";
import { alpacaBrokerRequest } from "@/lib/alpaca/client";
import type { AlpacaAccount, AlpacaAccountCreateInput, AlpacaAccountSnapshot } from "@/lib/alpaca/types";

export async function createBrokerageAccount(
  input: AlpacaAccountCreateInput,
): Promise<AlpacaAccount> {
  return alpacaBrokerRequest<AlpacaAccount>("/v1/accounts", {
    method: "POST",
    body: JSON.stringify({
      contact: {
        email_address: input.contact.emailAddress,
        phone_number: input.contact.phoneNumber,
        street_address: input.contact.streetAddress,
        city: input.contact.city,
        state: input.contact.state,
        postal_code: input.contact.postalCode,
        country: input.contact.country,
      },
      identity: {
        given_name: input.identity.givenName,
        family_name: input.identity.familyName,
        date_of_birth: input.identity.dateOfBirth,
        tax_id: input.identity.taxId,
        tax_id_type: input.identity.taxIdType,
        country_of_citizenship: input.identity.countryOfCitizenship,
        country_of_birth: input.identity.countryOfBirth,
        country_of_tax_residence: input.identity.countryOfTaxResidence,
        funding_source: input.identity.fundingSource,
      },
      disclosures: {
        is_control_person: input.disclosures.isControlPerson,
        is_affiliated_exchange_or_finra: input.disclosures.isAffiliatedExchangeOrFinra,
        is_politically_exposed: input.disclosures.isPoliticallyExposed,
        immediate_family_exposed: input.disclosures.immediateFamilyExposed,
      },
      agreements: input.agreements.map((a) => ({
        agreement: a.agreement,
        signed_at: a.signedAt,
        ip_address: a.ipAddress,
      })),
    }),
  });
}

export async function getAccount(accountId: string): Promise<AlpacaAccount> {
  return alpacaBrokerRequest<AlpacaAccount>(`/v1/accounts/${accountId}`);
}

export async function getAccountSnapshot(accountId: string): Promise<AlpacaAccountSnapshot> {
  return alpacaBrokerRequest<AlpacaAccountSnapshot>(`/v1/trading/accounts/${accountId}/account`);
}

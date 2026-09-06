import "server-only";
import { alpacaBrokerRequest } from "@/lib/alpaca/client";
import type { AlpacaAchRelationship, AlpacaTransfer } from "@/lib/alpaca/types";

export async function createAchRelationship(
  accountId: string,
  processorToken: string,
): Promise<AlpacaAchRelationship> {
  return alpacaBrokerRequest<AlpacaAchRelationship>(
    `/v1/accounts/${accountId}/ach_relationships`,
    {
      method: "POST",
      body: JSON.stringify({
        processor_token: processorToken,
      }),
    },
  );
}

export async function createTransfer(
  accountId: string,
  relationshipId: string,
  amount: number,
  direction: "INCOMING" | "OUTGOING" = "INCOMING",
): Promise<AlpacaTransfer> {
  return alpacaBrokerRequest<AlpacaTransfer>(`/v1/accounts/${accountId}/transfers`, {
    method: "POST",
    body: JSON.stringify({
      transfer_type: "ach",
      relationship_id: relationshipId,
      amount: amount.toFixed(2),
      direction,
    }),
  });
}

export async function listAchRelationships(accountId: string): Promise<AlpacaAchRelationship[]> {
  return alpacaBrokerRequest<AlpacaAchRelationship[]>(`/v1/accounts/${accountId}/ach_relationships`);
}

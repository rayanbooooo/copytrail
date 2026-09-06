import "server-only";
import { alpacaBrokerRequest } from "@/lib/alpaca/client";
import type { AlpacaOrder, AlpacaOrderRequest } from "@/lib/alpaca/types";

export async function submitOrder(
  accountId: string,
  payload: AlpacaOrderRequest,
): Promise<AlpacaOrder> {
  return alpacaBrokerRequest<AlpacaOrder>(`/v1/trading/accounts/${accountId}/orders`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getOrder(accountId: string, orderId: string): Promise<AlpacaOrder> {
  return alpacaBrokerRequest<AlpacaOrder>(`/v1/trading/accounts/${accountId}/orders/${orderId}`);
}

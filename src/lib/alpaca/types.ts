export interface AlpacaAccountCreateInput {
  contact: {
    emailAddress: string;
    phoneNumber: string;
    streetAddress: string[];
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  identity: {
    givenName: string;
    familyName: string;
    dateOfBirth: string; // YYYY-MM-DD
    taxId: string; // full SSN, only ever held in memory server-side, never persisted
    taxIdType: "USA_SSN";
    countryOfCitizenship: string;
    countryOfBirth: string;
    countryOfTaxResidence: string;
    fundingSource: string[];
  };
  disclosures: {
    isControlPerson: boolean;
    isAffiliatedExchangeOrFinra: boolean;
    isPoliticallyExposed: boolean;
    immediateFamilyExposed: boolean;
  };
  agreements: Array<{
    agreement: "customer_agreement" | "margin_agreement" | "account_agreement";
    signedAt: string;
    ipAddress: string;
  }>;
}

export interface AlpacaAccount {
  id: string;
  account_number: string;
  status: string;
  crypto_status?: string;
  currency: string;
  created_at: string;
}

export interface AlpacaAchRelationship {
  id: string;
  account_id: string;
  status: string;
  bank_account_type?: string;
}

export interface AlpacaTransfer {
  id: string;
  relationship_id: string;
  amount: string;
  direction: "INCOMING" | "OUTGOING";
  status: string;
}

export interface AlpacaOrderRequest {
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit";
  time_in_force: "day" | "gtc";
  notional?: string;
  qty?: string;
  limit_price?: string;
}

export interface AlpacaOrder {
  id: string;
  client_order_id: string;
  symbol: string;
  side: "buy" | "sell";
  type: string;
  qty: string | null;
  notional: string | null;
  filled_qty: string;
  filled_avg_price: string | null;
  status: string;
  submitted_at: string;
  filled_at: string | null;
}

export interface AlpacaTradeUpdateEvent {
  event: "fill" | "partial_fill" | "canceled" | "rejected" | "new" | string;
  event_id: string;
  account_id: string;
  order: AlpacaOrder;
  price?: string;
  qty?: string;
  timestamp: string;
}

export interface AlpacaAccountSnapshot {
  id: string;
  cash: string;
  equity: string;
  buying_power: string;
  portfolio_value: string;
}

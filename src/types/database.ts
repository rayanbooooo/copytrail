// Hand-written mirror of the Supabase schema in supabase/migrations/.
// Swap for `supabase gen types typescript` output once a live project
// exists; the shape is kept 1:1 with the SQL so that swap is a no-op.

export type KycStatus = "pending" | "approved" | "rejected";
export type FollowStatus = "active" | "paused";
export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit";
export type SubscriptionStatus = "active" | "past_due" | "canceled";
export type TradeSource = "self" | "copy";

export interface ProfileRow {
  id: string;
  email: string;
  alpaca_account_id: string | null;
  kyc_status: KycStatus;
  subscription_active: boolean;
  subscription_renews_at: string | null;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface WalletRow {
  id: string;
  user_id: string;
  cash_balance: number;
  portfolio_value: number;
  updated_at: string;
}

export interface LeaderRow {
  id: string;
  profile_id: string;
  bio: string;
  strategy_tags: string[];
  risk_score: number;
  win_rate: number;
  total_return_30d: number;
  is_verified: boolean;
  created_at: string;
}

export interface FollowRow {
  id: string;
  follower_id: string;
  leader_id: string;
  allocation_amount: number;
  status: FollowStatus;
  created_at: string;
}

export interface TradeRow {
  id: string;
  user_id: string;
  alpaca_order_id: string | null;
  symbol: string;
  qty: number;
  side: OrderSide;
  order_type: OrderType;
  execution_price: number | null;
  platform_fee: number;
  source: TradeSource;
  source_trade_id: string | null;
  executed_at: string | null;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  amount: number;
  status: SubscriptionStatus;
  next_billing_date: string | null;
  created_at: string;
}

export interface WebhookEventRow {
  id: string;
  source: string;
  external_id: string;
  payload: Record<string, unknown>;
  processed_at: string;
}

export interface LeaderCopierCountRow {
  leader_id: string;
  active_copier_count: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: Partial<ProfileRow>; Update: Partial<ProfileRow> };
      wallets: { Row: WalletRow; Insert: Partial<WalletRow>; Update: Partial<WalletRow> };
      leaders: { Row: LeaderRow; Insert: Partial<LeaderRow>; Update: Partial<LeaderRow> };
      follows: { Row: FollowRow; Insert: Partial<FollowRow>; Update: Partial<FollowRow> };
      trades: { Row: TradeRow; Insert: Partial<TradeRow>; Update: Partial<TradeRow> };
      subscriptions: {
        Row: SubscriptionRow;
        Insert: Partial<SubscriptionRow>;
        Update: Partial<SubscriptionRow>;
      };
      webhook_events: {
        Row: WebhookEventRow;
        Insert: Partial<WebhookEventRow>;
        Update: Partial<WebhookEventRow>;
      };
    };
    Views: {
      leader_copier_counts: { Row: LeaderCopierCountRow };
    };
  };
}

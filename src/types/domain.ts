import type { LeaderRow, ProfileRow } from "./database";

export interface LeaderCardData extends LeaderRow {
  displayName: string;
  copierCount: number;
}

export interface FollowingSummary {
  leader: LeaderCardData;
  allocationAmount: number;
  status: "active" | "paused";
}

export interface WalletSummary {
  cashBalance: number;
  portfolioValue: number;
}

export interface AuthedProfile extends ProfileRow {
  displayName: string;
}

export interface OrderQuote {
  symbol: string;
  price: number;
  changeAbsolute: number;
  changePercent: number;
  assetClass: "equity" | "forex";
  asOf: string;
}

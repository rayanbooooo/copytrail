import { describe, expect, it } from "vitest";
import { computeProportionalCopyNotional } from "./sizing";

describe("computeProportionalCopyNotional", () => {
  it("scales the follower's order to the same proportion of their allocation", () => {
    // Leader trades 5% of their equity ($5,000 of $100,000).
    const notional = computeProportionalCopyNotional({
      followerAllocation: 2000,
      leaderTradeNotional: 5000,
      leaderEquity: 100000,
      followerBuyingPower: 10000,
    });
    expect(notional).toBeCloseTo(100); // 5% of the follower's $2,000 allocation
  });

  it("caps the order at the follower's buying power", () => {
    const notional = computeProportionalCopyNotional({
      followerAllocation: 100000,
      leaderTradeNotional: 50000,
      leaderEquity: 100000, // leader trades 50% of equity
      followerBuyingPower: 500,
    });
    expect(notional).toBe(500);
  });

  it("returns 0 when leader equity is zero or negative", () => {
    expect(
      computeProportionalCopyNotional({
        followerAllocation: 1000,
        leaderTradeNotional: 500,
        leaderEquity: 0,
        followerBuyingPower: 1000,
      }),
    ).toBe(0);
  });

  it("returns 0 when the follower has no allocation", () => {
    expect(
      computeProportionalCopyNotional({
        followerAllocation: 0,
        leaderTradeNotional: 500,
        leaderEquity: 10000,
        followerBuyingPower: 1000,
      }),
    ).toBe(0);
  });
});

/**
 * Proportional copy-trade sizing.
 *
 * followerNotional = followerAllocation * (leaderTradeNotional / leaderEquity)
 *
 * Each follower's order is scaled to the same proportion of their committed
 * allocation that the leader's trade represents of the leader's total
 * equity — so followers get proportionally equivalent portfolio impact
 * regardless of how large or small their allocation is, rather than a flat
 * ratio to the leader's trade size alone (which would let a follower with a
 * $100 allocation mirror a $50,000 trade at full size).
 *
 * The result is capped at the follower's actual buying power so we never
 * submit an order Alpaca would reject for insufficient funds.
 */
export function computeProportionalCopyNotional(input: {
  followerAllocation: number;
  leaderTradeNotional: number;
  leaderEquity: number;
  followerBuyingPower: number;
}): number {
  const { followerAllocation, leaderTradeNotional, leaderEquity, followerBuyingPower } = input;

  if (leaderEquity <= 0 || followerAllocation <= 0 || leaderTradeNotional <= 0) return 0;

  const proportion = leaderTradeNotional / leaderEquity;
  const rawNotional = followerAllocation * proportion;

  return Math.max(0, Math.min(rawNotional, followerBuyingPower));
}

/** Minimum order size below which we skip submitting entirely (avoids
 * Alpaca rejecting dust-sized fractional orders and wasting a follower's
 * order slot on a trade too small to matter). */
export const MIN_COPY_NOTIONAL = 1;

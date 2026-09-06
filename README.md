# CopyTrail

A mobile-first social & copy-trading web app for stocks and forex. Brokerage,
clearing, custody, and KYC run through the **Alpaca Broker API** — this
platform never holds or clears funds itself. Bank linking and ACH funding go
through **Plaid**, feeding Alpaca's ACH endpoints. The $15/mo copy-trading
subscription is billed through **Stripe**; a $1.00 flat commission is logged
and collected on every self-directed trade.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Framer
Motion · TradingView `lightweight-charts` v4 · Supabase (Postgres + RLS +
Realtime) · Alpaca Broker API · Plaid · Stripe.

## Live preview

Deployed on Vercel, connected to a live Supabase project (schema + demo
leaderboard seed applied): https://copytrail-zeta.vercel.app

Alpaca, Plaid, and Stripe are intentionally unconfigured in this preview —
those sections of the app render `ConfigMissingBanner` instead of failing.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in real values, see below
npm run dev
```

The app builds and runs with **no external API keys configured** — every
integration point (Alpaca, Plaid, Stripe, Alpaca Market Data) checks its own
`isXConfigured()` flag (`src/lib/config/env.ts`) and renders a
`ConfigMissingBanner` instead of failing. Only Supabase is required to boot
at all, since auth and the database layer are load-bearing for every screen.

### Supabase

```bash
supabase start        # local Postgres + Auth + Studio
supabase db reset     # applies supabase/migrations/*.sql, then supabase/seed.sql
```

Copy the local project's URL/anon key/service role key (`supabase status`)
into `.env.local`. The seed data gives the Feed & Leaderboard screen three
demo leaders and one demo follower account (`demo.follower@example.com` /
`password123`) so it's fully demoable with zero external API keys.

### Alpaca / Plaid / Stripe

Fill in `.env.local` once you have real credentials:

- **Alpaca Broker API** and **Alpaca Market Data API** use *separate*
  credential pairs — the Broker API creates accounts/orders, Market Data
  streams quotes/bars for the Trading Terminal chart.
- **Plaid**: sandbox credentials are enough to exercise the Link flow
  end-to-end against Alpaca's sandbox.
- **Stripe**: test-mode keys work immediately — run `stripe listen --forward-to
  localhost:3000/api/stripe/webhook` locally to receive webhook events.

## Architecture notes worth knowing before you touch this code

- **RLS is deny-by-default.** `trades`, `wallets`, and `subscriptions` have
  no client write policies at all — every write goes through the
  service-role client from a server action or webhook handler that has
  already established its own authorization. See
  `supabase/migrations/0003_rls_policies.sql`.
- **The $1 self-directed platform fee is collected, not just logged.**
  `submitSelfDirectedOrder` (`src/lib/actions/trading.ts`) submits the order
  to Alpaca, then calls the `record_self_directed_trade` Postgres function
  (`supabase/migrations/0007_trade_rpc_functions.sql`), which inserts the
  trade row **and** debits `wallets.cash_balance` by $1.00 in one
  transaction — the fee can never be logged without being collected, or
  vice versa. **This creates deliberate, small drift** between our internal
  `cash_balance` ledger and Alpaca's actual account cash, since Alpaca is
  never told about the $1 debit. Reconciling that accumulated drift back to
  the business (a periodic ACH pull, or an Alpaca journal entry) is **not
  implemented** — it's the one piece of real money movement this build
  intentionally defers. Note also that `/api/cron/sync-accounts` overwrites
  `cash_balance` with Alpaca's authoritative number on every run, which
  currently erases this drift rather than reconciling it; fix that before
  relying on the cron sync in production.
- **Copy trades never carry the $1 fee.** `record_copy_trade` always writes
  `platform_fee = 0, source = 'copy'` — followers pay via the $15/mo
  subscription instead.
- **No persistent market-data websocket.** A long-lived Alpaca stream
  connection doesn't fit a serverless function. `useRealtimePrice` polls
  `/api/market/quote` every 5s instead; swapping in a real streaming relay
  (a small always-on worker publishing over Supabase Realtime) only
  requires changing that one hook.
- **The copy-engine's webhook fan-out has no durable retry.** A failed
  follower order (insufficient buying power, a rejected order) is recorded
  in the triggering `webhook_events` row and not automatically retried. Fine
  at today's scale; a queue (Inngest/Trigger.dev) is the documented fix if
  volume grows.
- **KYC is a single placeholder form.** Alpaca's real KYC flow (identity
  verification, disclosures, documents) is multi-step; `onboarding/kyc`
  ships a simplified single-page version pending review of the real
  requirements once live credentials are available.

## Manual smoke-test checklist

Nothing in this repo has been run against a live Supabase/Alpaca/Plaid
project — verify locally as follows:

1. **Build & types**: `npm run typecheck && npm run lint && npm run build`.
2. **Unit tests**: `npm test` (currently covers the copy-engine sizing
   formula in `src/lib/copy-engine/sizing.test.ts`).
3. **Auth**: sign up, confirm a `profiles` + `wallets` row appears (via the
   `handle_new_user` trigger), sign out, sign back in. Try visiting `/feed`
   signed out — should redirect to `/login`.
4. **Feed**: with `supabase db reset` seed data loaded, the leaderboard
   should render three leaders with win rate / risk / copier stats. Opening
   the follow modal and confirming an allocation should create a `follows`
   row.
5. **Terminal**: `/trade/AAPL` should render the `ConfigMissingBanner` in
   place of the chart and price header until `ALPACA_MARKET_DATA_API_*` is
   set. Submitting an order without `ALPACA_BROKER_API_*` set should return
   a clear "Alpaca isn't connected yet" error rather than crashing.
6. **Wallet**: without Stripe configured, the subscription section shows
   `ConfigMissingBanner`. With Stripe test keys + `stripe listen`, running
   `stripe trigger checkout.session.completed` should flip
   `profiles.subscription_active` to `true`.
7. **Copy webhook**: with `ALPACA_WEBHOOK_SECRET` set, POST a fixture
   Alpaca `fill` event to `/api/alpaca/webhook` with a valid HMAC-SHA256
   signature in the `x-alpaca-signature` header. A second identical POST
   should be a no-op (`{ deduped: true }`).

## Project layout

See `src/app` for routes (route groups `(auth)` and `(app)`), `src/lib` for
all business logic (organized by integration: `alpaca/`, `plaid/`, `stripe/`,
`copy-engine/`, plus `supabase/`, `actions/`, `db/`), and
`supabase/migrations` for the full schema history.

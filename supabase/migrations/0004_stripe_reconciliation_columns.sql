-- 0004_stripe_reconciliation_columns.sql
-- Placeholder migration reserved for future Stripe reconciliation columns
-- (e.g. invoice history, payment method metadata) beyond stripe_customer_id
-- and stripe_subscription_id, which already ship in 0001 since both tables
-- were newly created in this same migration set. Kept as its own numbered
-- migration so later Stripe-related schema changes have an obvious home
-- without renumbering existing files.
select 1;

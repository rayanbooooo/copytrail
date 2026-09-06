-- 0005_trade_source_and_webhook_events.sql
-- Placeholder migration reserved for future trade-source/webhook-event
-- schema changes. trade_source_enum, trades.source, trades.source_trade_id,
-- and webhook_events already ship in 0001 since these are new tables/columns
-- in a greenfield schema. Kept as its own numbered migration so the
-- migration history documents the plan's phasing and gives later additions
-- (e.g. a retry_count on webhook_events) an obvious home.
select 1;

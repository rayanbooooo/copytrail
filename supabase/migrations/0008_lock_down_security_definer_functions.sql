-- 0008_lock_down_security_definer_functions.sql
--
-- SECURITY FIX: Postgres grants EXECUTE on newly created functions to
-- PUBLIC by default, and this Supabase project's default privileges
-- additionally grant EXECUTE directly to anon/authenticated on every new
-- function. Neither 0006 nor 0007 revoked those grants, which meant
-- record_self_directed_trade, record_copy_trade, and
-- reconcile_trade_execution — all SECURITY DEFINER functions that bypass
-- RLS and are meant to be called only by trusted server code via the
-- service-role client — were reachable by ANY signed-in or anonymous
-- caller via PostgREST's automatic /rest/v1/rpc/<function> endpoints.
-- That would have let any user forge trades or manipulate wallet balances
-- directly. handle_new_user() is included too even though it's a trigger
-- function (calling it directly via RPC would fail without trigger
-- context) — no reason to leave it reachable either.
--
-- Discovered via `get_advisors` (security) immediately after applying
-- 0006/0007 to a live project — see 0009 for the follow-up once revoking
-- from PUBLIC alone proved insufficient.

revoke execute on function record_self_directed_trade(uuid, text, text, numeric, order_side_enum, order_type_enum, numeric) from public;
revoke execute on function record_copy_trade(uuid, text, text, numeric, order_side_enum, order_type_enum, uuid) from public;
revoke execute on function reconcile_trade_execution(text, numeric, timestamptz) from public;
revoke execute on function handle_new_user() from public;

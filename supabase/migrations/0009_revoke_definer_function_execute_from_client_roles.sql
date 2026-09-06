-- 0009_revoke_definer_function_execute_from_client_roles.sql
--
-- Follow-up to 0008: revoking EXECUTE from PUBLIC was not sufficient on
-- this Supabase project because its ALTER DEFAULT PRIVILEGES setup grants
-- EXECUTE directly to anon/authenticated on every newly created function,
-- independent of the PUBLIC grant. Revoke those direct grants too so these
-- service-role-only functions are actually unreachable via PostgREST.
-- Verified via `get_advisors` (security) that this clears the
-- anon_security_definer_function_executable /
-- authenticated_security_definer_function_executable warnings for all four
-- functions.

revoke execute on function record_self_directed_trade(uuid, text, text, numeric, order_side_enum, order_type_enum, numeric) from anon, authenticated;
revoke execute on function record_copy_trade(uuid, text, text, numeric, order_side_enum, order_type_enum, uuid) from anon, authenticated;
revoke execute on function reconcile_trade_execution(text, numeric, timestamptz) from anon, authenticated;
revoke execute on function handle_new_user() from anon, authenticated;

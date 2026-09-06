-- 0007_trade_rpc_functions.sql
-- Atomic, security-definer RPCs for the two trade-writing paths in the app.
-- Both bypass RLS by design (trades/wallets have no client write policies —
-- see 0003) and are only ever invoked from trusted server code (the
-- self-directed order Server Action, and the copy-trading webhook handler)
-- using the service-role client.

-- Inserts a self-directed trade AND debits the $1 platform fee from the
-- user's wallet in a single transaction, so the fee can never be logged
-- without being collected (or vice versa).
create function record_self_directed_trade(
  p_user_id uuid,
  p_alpaca_order_id text,
  p_symbol text,
  p_qty numeric,
  p_side order_side_enum,
  p_order_type order_type_enum,
  p_platform_fee numeric default 1.00
)
returns trades
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trade trades;
begin
  insert into trades (user_id, alpaca_order_id, symbol, qty, side, order_type, platform_fee, source)
  values (p_user_id, p_alpaca_order_id, p_symbol, p_qty, p_side, p_order_type, p_platform_fee, 'self')
  returning * into v_trade;

  update wallets
  set cash_balance = cash_balance - p_platform_fee,
      updated_at = now()
  where user_id = p_user_id;

  return v_trade;
end;
$$;

-- Inserts a copy-engine-generated trade. Always platform_fee = 0 and no
-- wallet debit: followers pay via the $15/mo subscription, not per trade.
create function record_copy_trade(
  p_user_id uuid,
  p_alpaca_order_id text,
  p_symbol text,
  p_qty numeric,
  p_side order_side_enum,
  p_order_type order_type_enum,
  p_source_trade_id uuid
)
returns trades
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trade trades;
begin
  insert into trades (
    user_id, alpaca_order_id, symbol, qty, side, order_type,
    platform_fee, source, source_trade_id
  )
  values (
    p_user_id, p_alpaca_order_id, p_symbol, p_qty, p_side, p_order_type,
    0, 'copy', p_source_trade_id
  )
  returning * into v_trade;

  return v_trade;
end;
$$;

-- Reconciles a trade's execution price/time once Alpaca's trade-update
-- webhook confirms the fill. Idempotent: safe to call repeatedly for the
-- same order_id as partial fills arrive.
create function reconcile_trade_execution(
  p_alpaca_order_id text,
  p_execution_price numeric,
  p_executed_at timestamptz
)
returns trades
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trade trades;
begin
  update trades
  set execution_price = p_execution_price,
      executed_at = p_executed_at
  where alpaca_order_id = p_alpaca_order_id
  returning * into v_trade;

  return v_trade;
end;
$$;

grant execute on function record_self_directed_trade to service_role;
grant execute on function record_copy_trade to service_role;
grant execute on function reconcile_trade_execution to service_role;

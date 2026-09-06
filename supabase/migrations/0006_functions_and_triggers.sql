-- 0006_functions_and_triggers.sql

-- Creates a profiles + wallets row automatically whenever a new user signs
-- up via Supabase Auth. Runs as security definer so it can insert into
-- tables the client role has no insert policy on.
create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);

  insert into public.wallets (user_id, cash_balance, portfolio_value)
  values (new.id, 0, 0);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Public aggregate copier counts per leader, so the Feed/Leaderboard screen
-- can show "N copiers" without granting raw SELECT on all of `follows` to
-- every user (follows RLS only exposes a follower's own rows).
create view leader_copier_counts
with (security_invoker = true)
as
select
  leader_id,
  count(*) filter (where status = 'active') as active_copier_count
from follows
group by leader_id;

grant select on leader_copier_counts to authenticated;

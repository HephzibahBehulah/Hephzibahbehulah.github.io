-- Only trusted server code may read account audit events or write admin-operation logs.
grant usage on schema auth to service_role;
grant select on auth.audit_log_entries to service_role;
create or replace view public.hb_admin_auth_events with (security_invoker = true) as
 select id, created_at, left(payload->>'action',100) as action,
 left(payload->>'actor_id',80) as actor_id,
 left(payload->>'actor_username',254) as actor_email,
 ip_address::text as ip_address
 from auth.audit_log_entries;
revoke all on public.hb_admin_auth_events from public, anon, authenticated;
grant select on public.hb_admin_auth_events to service_role;
create table if not exists public.hb_admin_operations (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 actor_email text not null,
 target_user_id uuid not null,
 action text not null check (action in ('pause_login_24h','allow_login')),
 reason text not null check (length(reason) between 10 and 500),
 status text not null check (status in ('requested','succeeded','failed'))
);
alter table public.hb_admin_operations add column if not exists reason text not null default 'Legacy operation';
alter table public.hb_admin_operations enable row level security;
revoke all on public.hb_admin_operations from public, anon, authenticated;
grant select, insert, update on public.hb_admin_operations to service_role;

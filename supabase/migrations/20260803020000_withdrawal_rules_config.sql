-- Migración para reglas configurables y auditables de retiros en Gananza

create table if not exists public.withdrawal_rule_configs (
  id uuid primary key default gen_random_uuid(),
  min_amount_mercado_pago numeric(14,2) not null check (min_amount_mercado_pago > 0),
  min_amount_bank_transfer numeric(14,2) not null check (min_amount_bank_transfer > 0),
  max_active_requests integer not null check (max_active_requests > 0),
  cooldown_days_after_paid integer not null check (cooldown_days_after_paid >= 0),
  require_available_balance boolean not null default true,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Habilitar Row Level Security
alter table public.withdrawal_rule_configs enable row level security;

-- Política de lectura para usuarios autenticados y anon
create policy "withdrawal_rule_configs_read_all" on public.withdrawal_rule_configs
  for select to authenticated, anon using (true);

-- Política de modificación restringida a administradores
create policy "withdrawal_rule_configs_admin_all" on public.withdrawal_rule_configs
  for all to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- Función SQL server-side para consultar las reglas vigentes
create or replace function public.get_current_withdrawal_rules()
returns setof public.withdrawal_rule_configs language sql stable security definer set search_path = '' as $$
  select *
  from public.withdrawal_rule_configs
  order by updated_at desc
  limit 1;
$$;

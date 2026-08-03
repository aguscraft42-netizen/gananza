-- Migración para la configuración manual y auditable del tipo de cambio ARS/USD en Gananza

create table if not exists public.exchange_rate_configs (
  id uuid primary key default gen_random_uuid(),
  base_currency text not null default 'USD',
  target_currency text not null default 'ARS',
  fx_rate_ars_usd numeric(14,4) not null check (fx_rate_ars_usd > 0),
  fx_source text not null default 'Manual Admin',
  fx_effective_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Habilitar Row Level Security
alter table public.exchange_rate_configs enable row level security;

-- Política de lectura para todos los usuarios autenticados y anon
create policy "exchange_rate_configs_read_all" on public.exchange_rate_configs
  for select to authenticated, anon using (true);

-- Política de modificación restringida a administradores
create policy "exchange_rate_configs_admin_all" on public.exchange_rate_configs
  for all to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- Función SQL server-side reutilizable para obtener el tipo de cambio vigente
create or replace function public.get_current_exchange_rate()
returns numeric language sql stable security definer set search_path = '' as $$
  select fx_rate_ars_usd
  from public.exchange_rate_configs
  where base_currency = 'USD' and target_currency = 'ARS'
  order by fx_effective_at desc, updated_at desc
  limit 1;
$$;

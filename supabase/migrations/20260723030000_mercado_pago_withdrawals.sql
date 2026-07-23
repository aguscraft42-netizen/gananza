-- Gananza V5.1 - Mercado Pago payout hardening
-- This migration keeps the existing withdrawal RPC contract stable for users,
-- snapshots payout details, adds a change cooldown, and requires a transfer
-- reference before an approved withdrawal can be marked as paid.

alter table public.payout_methods
  add column if not exists holder_document text,
  add column if not exists destination_hash text,
  add column if not exists verified_at timestamptz,
  add column if not exists verification_note text,
  add column if not exists cooldown_until timestamptz,
  add column if not exists last_used_at timestamptz;

alter table public.withdrawals
  add column if not exists payout_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists payment_receipt_url text,
  add column if not exists payment_receipt_name text,
  add column if not exists payment_sent_at timestamptz;

create or replace function private.normalized_payout_destination(p_value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select lower(regexp_replace(trim(p_value), '\\s+', '', 'g'));
$$;

create or replace function private.mask_payout_destination(p_value text)
returns text
language plpgsql
immutable
strict
set search_path = ''
as $$
declare
  v_value text := private.normalized_payout_destination(p_value);
begin
  if v_value ~ '^[0-9]{22}$' then
    return '•••• ' || right(v_value, 4);
  end if;
  if char_length(v_value) <= 8 then return v_value; end if;
  return left(v_value, 3) || '••••' || right(v_value, 3);
end;
$$;

create or replace function private.prepare_payout_method()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_changed boolean;
begin
  if tg_op = 'INSERT' then
    v_changed := true;
  else
    v_changed := new.destination is distinct from old.destination
      or new.method_type is distinct from old.method_type
      or new.holder_name is distinct from old.holder_name
      or new.holder_document is distinct from old.holder_document;
  end if;
  new.destination := private.normalized_payout_destination(new.destination);
  new.destination_masked := private.mask_payout_destination(new.destination);
  new.destination_hash := encode(extensions.digest(new.destination, 'sha256'), 'hex');
  new.holder_document := nullif(regexp_replace(coalesce(new.holder_document, ''), '[^0-9]', '', 'g'), '');

  if new.method_type = 'mercado_pago' then
    if not (new.destination ~ '^[0-9]{22}$' or new.destination ~ '^[a-z0-9][a-z0-9._-]{4,29}[a-z0-9]$') then
      raise exception 'Invalid Mercado Pago alias or CVU' using errcode = '22023';
    end if;
    if coalesce(char_length(trim(new.holder_name)), 0) < 4 then
      raise exception 'Mercado Pago holder name is required' using errcode = '22023';
    end if;
    if coalesce(char_length(new.holder_document), 0) not between 7 and 11 then
      raise exception 'Valid holder document is required' using errcode = '22023';
    end if;
  end if;

  if v_changed then
    new.is_verified := false;
    new.verified_at := null;
    new.verification_note := null;
    new.cooldown_until := now() + interval '24 hours';
  end if;

  return new;
end;
$$;

-- Normalize rows created before this migration.
update public.payout_methods
set destination = private.normalized_payout_destination(destination),
    destination_masked = private.mask_payout_destination(destination),
    destination_hash = encode(extensions.digest(private.normalized_payout_destination(destination), 'sha256'), 'hex'),
    cooldown_until = coalesce(cooldown_until, created_at)
where destination_hash is null;

alter table public.payout_methods
  alter column destination_hash set not null;

drop trigger if exists payout_methods_prepare on public.payout_methods;
create trigger payout_methods_prepare
before insert or update of destination, method_type, holder_name, holder_document
on public.payout_methods
for each row execute function private.prepare_payout_method();

alter table public.payout_methods
  drop constraint if exists payout_methods_holder_document_check;
alter table public.payout_methods
  add constraint payout_methods_holder_document_check
  check (holder_document is null or char_length(holder_document) between 7 and 11);

create index if not exists payout_methods_destination_hash_idx
  on public.payout_methods(destination_hash)
  where disabled_at is null;

create unique index if not exists withdrawals_one_active_per_user_idx
  on public.withdrawals(user_id)
  where status in ('requested','reviewing','approved');

create or replace function private.flag_shared_payout_destination()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_other uuid;
begin
  select pm.user_id into v_other
  from public.payout_methods pm
  where pm.destination_hash = new.destination_hash
    and pm.user_id <> new.user_id
    and pm.disabled_at is null
  limit 1;

  if v_other is not null and not exists (
    select 1 from public.fraud_flags ff
    where ff.user_id = new.user_id
      and ff.reason_code = 'shared_payout_destination'
      and ff.status in ('open','reviewing')
      and ff.metadata ->> 'destination_hash' = new.destination_hash
  ) then
    insert into public.fraud_flags (user_id, reason_code, description, severity, score, metadata)
    values (
      new.user_id,
      'shared_payout_destination',
      'El mismo destino de retiro aparece asociado a otra cuenta.',
      'high',
      75,
      jsonb_build_object('destination_hash', new.destination_hash, 'other_user_id', v_other)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists payout_methods_shared_destination on public.payout_methods;
create trigger payout_methods_shared_destination
after insert or update of destination_hash
on public.payout_methods
for each row execute function private.flag_shared_payout_destination();

create or replace function public.request_withdrawal(
  p_amount numeric,
  p_payout_method_id uuid,
  p_idempotency_key text
)
returns public.withdrawals
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_wallet public.wallets;
  v_method public.payout_methods;
  v_withdrawal public.withdrawals;
  v_key text := nullif(trim(p_idempotency_key), '');
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_amount < 5000 then raise exception 'Minimum withdrawal is 5000 ARS' using errcode = '22003'; end if;
  if v_key is null then raise exception 'Idempotency key required' using errcode = '22023'; end if;
  if exists (select 1 from public.profiles where id = v_user_id and suspended_at is not null) then
    raise exception 'Account suspended' using errcode = '42501';
  end if;

  select * into v_method from public.payout_methods
  where id = p_payout_method_id and user_id = v_user_id and disabled_at is null
  for update;
  if not found then raise exception 'Invalid payout method' using errcode = 'P0002'; end if;
  if v_method.cooldown_until is not null and v_method.cooldown_until > now() then
    raise exception 'Payout method is in security cooldown until %', v_method.cooldown_until using errcode = '55000';
  end if;
  if v_method.method_type = 'mercado_pago' and (
    v_method.holder_name is null or v_method.holder_document is null or v_method.destination_hash is null
  ) then
    raise exception 'Mercado Pago destination is incomplete' using errcode = '22023';
  end if;
  select * into v_wallet from public.wallets where user_id = v_user_id for update;
  if not found then raise exception 'Wallet unavailable'; end if;

  select * into v_withdrawal from public.withdrawals where idempotency_key = v_key and user_id = v_user_id;
  if found then return v_withdrawal; end if;

  if exists (
    select 1 from public.withdrawals
    where user_id = v_user_id and status in ('requested','reviewing','approved')
  ) then
    raise exception 'There is already an active withdrawal' using errcode = '55000';
  end if;
  if v_wallet.available_balance < p_amount then raise exception 'Insufficient available balance' using errcode = '22003'; end if;

  insert into public.withdrawals (
    user_id, payout_method_id, amount, idempotency_key, payout_snapshot
  ) values (
    v_user_id,
    p_payout_method_id,
    p_amount,
    v_key,
    jsonb_build_object(
      'method_type', v_method.method_type,
      'label', v_method.label,
      'destination_masked', v_method.destination_masked,
      'destination_hash', v_method.destination_hash,
      'holder_name', v_method.holder_name,
      'holder_document_last4', right(v_method.holder_document, 4)
    )
  ) returning * into v_withdrawal;

  insert into public.ledger_entries (
    user_id, entry_type, available_delta, held_delta, withdrawal_id,
    idempotency_key, description, created_by
  ) values (
    v_user_id, 'withdrawal_hold', -p_amount, p_amount, v_withdrawal.id,
    'withdrawal-hold:' || v_withdrawal.id::text,
    case when v_method.method_type = 'mercado_pago' then 'Saldo retenido para retiro a Mercado Pago' else 'Saldo retenido para retiro' end,
    v_user_id
  );

  update public.wallets
  set available_balance = available_balance - p_amount,
      held_balance = held_balance + p_amount,
      version = version + 1,
      updated_at = now()
  where user_id = v_user_id;

  update public.payout_methods set last_used_at = now() where id = v_method.id;

  insert into public.withdrawal_events (withdrawal_id, from_status, to_status, note, actor_id)
  values (v_withdrawal.id, null, 'requested', 'Solicitud creada por el usuario; destino guardado en snapshot', v_user_id);

  return v_withdrawal;
end;
$$;

-- Replace the V5 reviewer function with a version that also stores receipt metadata.
drop function if exists public.review_withdrawal(uuid,text,text,text);
create function public.review_withdrawal(
  p_withdrawal_id uuid,
  p_action text,
  p_note text default null,
  p_provider_reference text default null,
  p_receipt_url text default null,
  p_receipt_name text default null
)
returns public.withdrawals
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_withdrawal public.withdrawals;
  v_from public.withdrawal_status;
  v_to public.withdrawal_status;
  v_method_type text;
begin
  if v_actor is null or not (select private.has_role(array['reviewer','admin']::public.app_role[])) then
    raise exception 'Reviewer role required' using errcode = '42501';
  end if;
  select * into v_withdrawal from public.withdrawals where id = p_withdrawal_id for update;
  if not found then raise exception 'Withdrawal not found' using errcode = 'P0002'; end if;
  v_from := v_withdrawal.status;
  v_method_type := v_withdrawal.payout_snapshot ->> 'method_type';
  perform 1 from public.wallets where user_id = v_withdrawal.user_id for update;

  if p_action = 'review' and v_from = 'requested' then
    v_to := 'reviewing';
  elsif p_action = 'approve' and v_from in ('requested','reviewing') then
    v_to := 'approved';
  elsif p_action = 'reject' and v_from in ('requested','reviewing','approved') then
    v_to := 'rejected';
    insert into public.ledger_entries (user_id, entry_type, available_delta, held_delta, withdrawal_id, idempotency_key, description, created_by)
    values (v_withdrawal.user_id, 'withdrawal_release', v_withdrawal.amount, -v_withdrawal.amount, v_withdrawal.id,
            'withdrawal-reject:' || v_withdrawal.id::text, coalesce(p_note, 'Retiro rechazado'), v_actor)
    on conflict (idempotency_key) do nothing;
    update public.wallets set available_balance = available_balance + v_withdrawal.amount,
      held_balance = held_balance - v_withdrawal.amount, version = version + 1, updated_at = now()
    where user_id = v_withdrawal.user_id;
  elsif p_action = 'paid' and v_from = 'approved' then
    if coalesce(trim(p_provider_reference), '') = '' then
      raise exception 'Transfer reference is required before marking paid' using errcode = '22023';
    end if;
    v_to := 'paid';
    insert into public.ledger_entries (user_id, entry_type, held_delta, withdrawn_delta, withdrawal_id, idempotency_key, description, created_by)
    values (v_withdrawal.user_id, 'withdrawal_paid', -v_withdrawal.amount, v_withdrawal.amount, v_withdrawal.id,
            'withdrawal-paid:' || v_withdrawal.id::text,
            case when v_method_type = 'mercado_pago' then 'Retiro transferido a Mercado Pago' else 'Retiro pagado' end,
            v_actor)
    on conflict (idempotency_key) do nothing;
    update public.wallets set held_balance = held_balance - v_withdrawal.amount,
      withdrawn_balance = withdrawn_balance + v_withdrawal.amount, version = version + 1, updated_at = now()
    where user_id = v_withdrawal.user_id;
  else
    raise exception 'Invalid withdrawal transition from % using action %', v_from, p_action;
  end if;

  update public.withdrawals set
    status = v_to,
    reviewed_by = v_actor,
    reviewed_at = now(),
    paid_at = case when v_to = 'paid' then now() else paid_at end,
    payment_sent_at = case when v_to = 'paid' then now() else payment_sent_at end,
    rejection_reason = case when v_to = 'rejected' then p_note else rejection_reason end,
    provider_reference = coalesce(nullif(trim(p_provider_reference), ''), provider_reference),
    payment_receipt_url = coalesce(nullif(trim(p_receipt_url), ''), payment_receipt_url),
    payment_receipt_name = coalesce(nullif(trim(p_receipt_name), ''), payment_receipt_name)
  where id = v_withdrawal.id returning * into v_withdrawal;

  insert into public.withdrawal_events (withdrawal_id, from_status, to_status, note, actor_id)
  values (v_withdrawal.id, v_from, v_to, p_note, v_actor);
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, before_data, after_data)
  values (
    v_actor,
    'withdrawal.' || p_action,
    'withdrawal',
    v_withdrawal.id::text,
    jsonb_build_object('status', v_from),
    jsonb_build_object(
      'status', v_to,
      'note', p_note,
      'provider_reference', p_provider_reference,
      'receipt_name', p_receipt_name
    )
  );
  return v_withdrawal;
end;
$$;

revoke all on function public.review_withdrawal(uuid,text,text,text,text,text) from public;
grant execute on function public.review_withdrawal(uuid,text,text,text,text,text) to authenticated;

grant insert (holder_document) on public.payout_methods to authenticated;
grant update (holder_document) on public.payout_methods to authenticated;
revoke insert (destination_masked) on public.payout_methods from authenticated;
revoke update (destination_masked) on public.payout_methods from authenticated;

comment on column public.payout_methods.destination_hash is 'SHA-256 fingerprint used for duplicate-destination fraud checks; never shown to clients.';
comment on column public.withdrawals.payout_snapshot is 'Immutable masked payout details captured at request time.';
comment on column public.withdrawals.provider_reference is 'Manual Mercado Pago or banking transfer reference entered by a reviewer.';

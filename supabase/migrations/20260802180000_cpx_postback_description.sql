-- Migration to allow custom ledger entry descriptions passed inside p_payload ->> 'description'

create or replace function public.apply_provider_conversion(
  p_provider_slug text,
  p_external_transaction_id text,
  p_user_id uuid,
  p_offer_id uuid,
  p_status public.conversion_status,
  p_gross_amount numeric,
  p_user_reward numeric,
  p_payload jsonb default '{}'::jsonb
)
returns public.conversions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_provider_id uuid;
  v_conversion public.conversions;
  v_old_status public.conversion_status;
  v_wallet public.wallets;
  v_take numeric(14,2);
  v_debt numeric(14,2);
  v_debt_pay numeric(14,2);
  v_credit numeric(14,2);
  v_session_id uuid;
  v_key text;
  v_description text;
begin
  if (select auth.role()) <> 'service_role' then raise exception 'Service role required' using errcode = '42501'; end if;
  if p_user_reward < 0 or p_gross_amount < p_user_reward then raise exception 'Invalid amounts'; end if;
  select id into v_provider_id from public.providers where slug = p_provider_slug and is_active;
  if not found then raise exception 'Provider unavailable' using errcode = 'P0002'; end if;
  if not exists (select 1 from public.profiles where id = p_user_id) then raise exception 'User unavailable' using errcode = 'P0002'; end if;

  v_description := coalesce(nullif(trim(p_payload->>'description'), ''), 'Recompensa confirmada');

  if p_offer_id is not null then
    select id into v_session_id from public.task_sessions where user_id = p_user_id and offer_id = p_offer_id;
  end if;

  insert into public.wallets (user_id) values (p_user_id) on conflict do nothing;
  select * into v_wallet from public.wallets where user_id = p_user_id for update;

  select * into v_conversion from public.conversions
  where provider_id = v_provider_id and external_transaction_id = p_external_transaction_id for update;

  if not found then
    insert into public.conversions (provider_id, offer_id, task_session_id, user_id, external_transaction_id, status, gross_amount, user_reward, raw_payload, confirmed_at, rejected_at, reversed_at)
    values (v_provider_id, p_offer_id, v_session_id, p_user_id, p_external_transaction_id, p_status, p_gross_amount, p_user_reward, p_payload,
      case when p_status = 'confirmed' then now() end,
      case when p_status = 'rejected' then now() end,
      case when p_status = 'reversed' then now() end)
    returning * into v_conversion;

    if p_status = 'pending' then
      insert into public.ledger_entries (user_id, entry_type, pending_delta, conversion_id, idempotency_key, description)
      values (p_user_id, 'reward_pending', p_user_reward, v_conversion.id, 'conversion-pending:' || v_conversion.id::text, 'Recompensa pendiente');
      update public.wallets set pending_balance = pending_balance + p_user_reward, version = version + 1, updated_at = now() where user_id = p_user_id;
    elsif p_status = 'confirmed' then
      v_debt_pay := least(v_wallet.debt_balance, p_user_reward);
      v_credit := p_user_reward - v_debt_pay;
      insert into public.ledger_entries (user_id, entry_type, available_delta, debt_delta, conversion_id, idempotency_key, description)
      values (p_user_id, 'reward_confirmed', v_credit, -v_debt_pay, v_conversion.id, 'conversion-confirmed:' || v_conversion.id::text, v_description);
      update public.wallets set available_balance = available_balance + v_credit,
        debt_balance = debt_balance - v_debt_pay,
        lifetime_earned = lifetime_earned + p_user_reward, version = version + 1, updated_at = now() where user_id = p_user_id;
    end if;
  else
    v_old_status := v_conversion.status;
    if v_old_status = p_status then return v_conversion; end if;
    v_key := 'conversion-transition:' || v_conversion.id::text || ':' || v_old_status::text || '-' || p_status::text;

    if v_old_status = 'pending' and p_status = 'confirmed' then
      v_debt_pay := least(v_wallet.debt_balance, v_conversion.user_reward);
      v_credit := v_conversion.user_reward - v_debt_pay;
      insert into public.ledger_entries (user_id, entry_type, pending_delta, available_delta, debt_delta, conversion_id, idempotency_key, description)
      values (p_user_id, 'reward_confirmed', -v_conversion.user_reward, v_credit, -v_debt_pay, v_conversion.id, v_key, v_description);
      update public.wallets set pending_balance = pending_balance - v_conversion.user_reward,
        available_balance = available_balance + v_credit,
        debt_balance = debt_balance - v_debt_pay,
        lifetime_earned = lifetime_earned + v_conversion.user_reward,
        version = version + 1, updated_at = now() where user_id = p_user_id;
    elsif v_old_status = 'pending' and p_status in ('rejected','reversed') then
      insert into public.ledger_entries (user_id, entry_type, pending_delta, conversion_id, idempotency_key, description)
      values (p_user_id, case when p_status = 'rejected' then 'reward_rejected'::public.ledger_entry_type else 'reward_reversed'::public.ledger_entry_type end,
        -v_conversion.user_reward, v_conversion.id, v_key, 'Recompensa pendiente anulada');
      update public.wallets set pending_balance = pending_balance - v_conversion.user_reward,
        version = version + 1, updated_at = now() where user_id = p_user_id;
    elsif v_old_status = 'confirmed' and p_status = 'reversed' then
      v_take := least(v_wallet.available_balance, v_conversion.user_reward);
      v_debt := v_conversion.user_reward - v_take;
      insert into public.ledger_entries (user_id, entry_type, available_delta, debt_delta, conversion_id, idempotency_key, description)
      values (p_user_id, 'reward_reversed', -v_take, v_debt, v_conversion.id, v_key, coalesce(nullif(trim(p_payload->>'description'), ''), 'Reversión del proveedor'));
      update public.wallets set available_balance = available_balance - v_take,
        debt_balance = debt_balance + v_debt, version = version + 1, updated_at = now() where user_id = p_user_id;
    elsif v_old_status in ('rejected','reversed') and p_status = 'confirmed' then
      v_debt_pay := least(v_wallet.debt_balance, v_conversion.user_reward);
      v_credit := v_conversion.user_reward - v_debt_pay;
      insert into public.ledger_entries (user_id, entry_type, available_delta, debt_delta, conversion_id, idempotency_key, description)
      values (p_user_id, 'reward_confirmed', v_credit, -v_debt_pay, v_conversion.id, v_key, v_description);
      update public.wallets set available_balance = available_balance + v_credit,
        debt_balance = debt_balance - v_debt_pay,
        lifetime_earned = lifetime_earned + v_conversion.user_reward, version = version + 1, updated_at = now() where user_id = p_user_id;
    else
      raise exception 'Unsupported conversion transition from % to %', v_old_status, p_status;
    end if;

    update public.conversions set status = p_status, raw_payload = p_payload,
      confirmed_at = case when p_status = 'confirmed' then now() else confirmed_at end,
      rejected_at = case when p_status = 'rejected' then now() else rejected_at end,
      reversed_at = case when p_status = 'reversed' then now() else reversed_at end
    where id = v_conversion.id returning * into v_conversion;
  end if;

  if v_session_id is not null then
    update public.task_sessions set
      status = case p_status when 'pending' then 'pending'::public.task_session_status when 'confirmed' then 'confirmed'::public.task_session_status when 'rejected' then 'rejected'::public.task_session_status else 'reversed'::public.task_session_status end,
      progress = case when p_status in ('pending','confirmed','rejected','reversed') then 100 else progress end,
      completed_at = case when p_status in ('pending','confirmed') then coalesce(completed_at, now()) else completed_at end,
      last_provider_update_at = now()
    where id = v_session_id;
  end if;
  return v_conversion;
end;
$$;

revoke all on function public.apply_provider_conversion(text,text,uuid,uuid,public.conversion_status,numeric,numeric,jsonb) from public;
grant execute on function public.apply_provider_conversion(text,text,uuid,uuid,public.conversion_status,numeric,numeric,jsonb) to service_role;

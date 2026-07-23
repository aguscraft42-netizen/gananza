-- Gananza V5 - transactional operations and restricted RPCs

create or replace function public.start_task(p_offer_id uuid)
returns public.task_sessions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_country text;
  v_offer public.offers;
  v_session public.task_sessions;
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;

  select country_code into v_country from public.profiles where id = v_user_id and suspended_at is null;
  if v_country is null then raise exception 'Profile unavailable' using errcode = '42501'; end if;

  select * into v_offer from public.offers
  where id = p_offer_id
    and status = 'active'
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at > now())
    and v_country = any(country_codes);
  if not found then raise exception 'Offer unavailable' using errcode = 'P0002'; end if;

  insert into public.task_sessions (offer_id, user_id, status, provider_click_id, progress, started_at)
  values (v_offer.id, v_user_id, 'started', encode(extensions.gen_random_bytes(16), 'hex'), 0, now())
  on conflict (user_id, offer_id) do update
    set updated_at = now(),
        status = case when public.task_sessions.status = 'opened' then 'started'::public.task_session_status else public.task_sessions.status end,
        started_at = coalesce(public.task_sessions.started_at, now())
  returning * into v_session;

  return v_session;
end;
$$;

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
  where id = p_payout_method_id and user_id = v_user_id and disabled_at is null;
  if not found then raise exception 'Invalid payout method' using errcode = 'P0002'; end if;

  select * into v_wallet from public.wallets where user_id = v_user_id for update;
  if not found then raise exception 'Wallet unavailable'; end if;

  -- The wallet lock serializes requests for the same user. Re-checking after the lock
  -- makes repeated concurrent requests return the original withdrawal instead of failing.
  select * into v_withdrawal from public.withdrawals where idempotency_key = v_key and user_id = v_user_id;
  if found then return v_withdrawal; end if;

  if v_wallet.available_balance < p_amount then raise exception 'Insufficient available balance' using errcode = '22003'; end if;

  insert into public.withdrawals (user_id, payout_method_id, amount, idempotency_key)
  values (v_user_id, p_payout_method_id, p_amount, v_key)
  returning * into v_withdrawal;

  insert into public.ledger_entries (
    user_id, entry_type, available_delta, held_delta, withdrawal_id,
    idempotency_key, description, created_by
  ) values (
    v_user_id, 'withdrawal_hold', -p_amount, p_amount, v_withdrawal.id,
    'withdrawal-hold:' || v_withdrawal.id::text, 'Saldo retenido para retiro', v_user_id
  );

  update public.wallets
  set available_balance = available_balance - p_amount,
      held_balance = held_balance + p_amount,
      version = version + 1,
      updated_at = now()
  where user_id = v_user_id;

  insert into public.withdrawal_events (withdrawal_id, from_status, to_status, note, actor_id)
  values (v_withdrawal.id, null, 'requested', 'Solicitud creada por el usuario', v_user_id);

  return v_withdrawal;
end;
$$;

create or replace function public.cancel_withdrawal(p_withdrawal_id uuid)
returns public.withdrawals
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_withdrawal public.withdrawals;
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select * into v_withdrawal from public.withdrawals
  where id = p_withdrawal_id and user_id = v_user_id for update;
  if not found then raise exception 'Withdrawal not found' using errcode = 'P0002'; end if;
  if v_withdrawal.status <> 'requested' then raise exception 'Withdrawal can no longer be cancelled'; end if;

  perform 1 from public.wallets where user_id = v_user_id for update;
  update public.withdrawals set status = 'cancelled' where id = v_withdrawal.id returning * into v_withdrawal;
  insert into public.ledger_entries (user_id, entry_type, available_delta, held_delta, withdrawal_id, idempotency_key, description, created_by)
  values (v_user_id, 'withdrawal_release', v_withdrawal.amount, -v_withdrawal.amount, v_withdrawal.id,
          'withdrawal-cancel:' || v_withdrawal.id::text, 'Retención liberada por cancelación', v_user_id);
  update public.wallets set available_balance = available_balance + v_withdrawal.amount,
    held_balance = held_balance - v_withdrawal.amount, version = version + 1, updated_at = now()
  where user_id = v_user_id;
  insert into public.withdrawal_events (withdrawal_id, from_status, to_status, note, actor_id)
  values (v_withdrawal.id, 'requested', 'cancelled', 'Cancelado por el usuario', v_user_id);
  return v_withdrawal;
end;
$$;

create or replace function public.review_withdrawal(
  p_withdrawal_id uuid,
  p_action text,
  p_note text default null,
  p_provider_reference text default null
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
begin
  if v_actor is null or not (select private.has_role(array['reviewer','admin']::public.app_role[])) then
    raise exception 'Reviewer role required' using errcode = '42501';
  end if;
  select * into v_withdrawal from public.withdrawals where id = p_withdrawal_id for update;
  if not found then raise exception 'Withdrawal not found' using errcode = 'P0002'; end if;
  v_from := v_withdrawal.status;
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
    v_to := 'paid';
    insert into public.ledger_entries (user_id, entry_type, held_delta, withdrawn_delta, withdrawal_id, idempotency_key, description, created_by)
    values (v_withdrawal.user_id, 'withdrawal_paid', -v_withdrawal.amount, v_withdrawal.amount, v_withdrawal.id,
            'withdrawal-paid:' || v_withdrawal.id::text, 'Retiro pagado', v_actor)
    on conflict (idempotency_key) do nothing;
    update public.wallets set held_balance = held_balance - v_withdrawal.amount,
      withdrawn_balance = withdrawn_balance + v_withdrawal.amount, version = version + 1, updated_at = now()
    where user_id = v_withdrawal.user_id;
  else
    raise exception 'Invalid withdrawal transition from % using action %', v_from, p_action;
  end if;

  update public.withdrawals set status = v_to, reviewed_by = v_actor, reviewed_at = now(),
    paid_at = case when v_to = 'paid' then now() else paid_at end,
    rejection_reason = case when v_to = 'rejected' then p_note else rejection_reason end,
    provider_reference = coalesce(p_provider_reference, provider_reference)
  where id = v_withdrawal.id returning * into v_withdrawal;

  insert into public.withdrawal_events (withdrawal_id, from_status, to_status, note, actor_id)
  values (v_withdrawal.id, v_from, v_to, p_note, v_actor);
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, before_data, after_data)
  values (v_actor, 'withdrawal.' || p_action, 'withdrawal', v_withdrawal.id::text,
          jsonb_build_object('status', v_from), jsonb_build_object('status', v_to, 'note', p_note));
  return v_withdrawal;
end;
$$;

create or replace function public.create_support_ticket(
  p_subject text,
  p_category text,
  p_body text,
  p_task_session_id uuid default null,
  p_withdrawal_id uuid default null
)
returns public.support_tickets
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_ticket public.support_tickets;
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if char_length(trim(p_subject)) < 4 or char_length(trim(p_body)) < 8 then
    raise exception 'Subject or message too short' using errcode = '22023';
  end if;
  if p_task_session_id is not null and not exists (select 1 from public.task_sessions where id = p_task_session_id and user_id = v_user_id) then
    raise exception 'Invalid task session' using errcode = '42501';
  end if;
  if p_withdrawal_id is not null and not exists (select 1 from public.withdrawals where id = p_withdrawal_id and user_id = v_user_id) then
    raise exception 'Invalid withdrawal' using errcode = '42501';
  end if;
  insert into public.support_tickets (user_id, task_session_id, withdrawal_id, subject, category)
  values (v_user_id, p_task_session_id, p_withdrawal_id, trim(p_subject), coalesce(nullif(trim(p_category), ''), 'general'))
  returning * into v_ticket;
  insert into public.support_messages (ticket_id, author_id, body)
  values (v_ticket.id, v_user_id, trim(p_body));
  return v_ticket;
end;
$$;

-- Called only from a trusted server using the service-role key.
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
begin
  if (select auth.role()) <> 'service_role' then raise exception 'Service role required' using errcode = '42501'; end if;
  if p_user_reward <= 0 or p_gross_amount < p_user_reward then raise exception 'Invalid amounts'; end if;
  select id into v_provider_id from public.providers where slug = p_provider_slug and is_active;
  if not found then raise exception 'Provider unavailable' using errcode = 'P0002'; end if;
  if not exists (select 1 from public.profiles where id = p_user_id) then raise exception 'User unavailable' using errcode = 'P0002'; end if;

  select id into v_session_id from public.task_sessions where user_id = p_user_id and offer_id = p_offer_id;
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
      values (p_user_id, 'reward_confirmed', v_credit, -v_debt_pay, v_conversion.id, 'conversion-confirmed:' || v_conversion.id::text, 'Recompensa confirmada');
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
      values (p_user_id, 'reward_confirmed', -v_conversion.user_reward, v_credit, -v_debt_pay, v_conversion.id, v_key, 'Recompensa liberada');
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
      values (p_user_id, 'reward_reversed', -v_take, v_debt, v_conversion.id, v_key, 'Reversión del proveedor');
      update public.wallets set available_balance = available_balance - v_take,
        debt_balance = debt_balance + v_debt, version = version + 1, updated_at = now() where user_id = p_user_id;
    elsif v_old_status in ('rejected','reversed') and p_status = 'confirmed' then
      v_debt_pay := least(v_wallet.debt_balance, v_conversion.user_reward);
      v_credit := v_conversion.user_reward - v_debt_pay;
      insert into public.ledger_entries (user_id, entry_type, available_delta, debt_delta, conversion_id, idempotency_key, description)
      values (p_user_id, 'reward_confirmed', v_credit, -v_debt_pay, v_conversion.id, v_key, 'Recompensa confirmada después de revisión');
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

create or replace function public.get_provider_webhook_secret(p_provider_slug text)
returns table(provider_id uuid, callback_secret text, signing_algorithm text)
language sql
security definer
set search_path = ''
as $$
  select p.id, c.callback_secret, c.signing_algorithm
  from public.providers p join private.provider_credentials c on c.provider_id = p.id
  where p.slug = p_provider_slug and p.is_active;
$$;

create or replace function public.record_webhook_event(
  p_provider_id uuid,
  p_external_event_id text,
  p_signature_valid boolean,
  p_payload jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare v_id uuid;
begin
  if (select auth.role()) <> 'service_role' then raise exception 'Service role required' using errcode = '42501'; end if;
  insert into private.webhook_events (provider_id, external_event_id, signature_valid, payload)
  values (p_provider_id, p_external_event_id, p_signature_valid, p_payload)
  on conflict (provider_id, external_event_id) do update set payload = excluded.payload, signature_valid = excluded.signature_valid
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.admin_dashboard_metrics()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select private.has_role(array['support','reviewer','admin']::public.app_role[])) then
    raise exception 'Staff role required' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'users', (select count(*) from public.profiles where suspended_at is null),
    'pending_conversions', (select count(*) from public.conversions where status = 'pending'),
    'pending_withdrawals', (select count(*) from public.withdrawals where status in ('requested','reviewing','approved')),
    'open_tickets', (select count(*) from public.support_tickets where status not in ('resolved','closed')),
    'open_fraud_flags', (select count(*) from public.fraud_flags where status in ('open','reviewing'))
  );
end;
$$;

revoke all on function public.start_task(uuid) from public;
revoke all on function public.request_withdrawal(numeric,uuid,text) from public;
revoke all on function public.cancel_withdrawal(uuid) from public;
revoke all on function public.review_withdrawal(uuid,text,text,text) from public;
revoke all on function public.create_support_ticket(text,text,text,uuid,uuid) from public;
revoke all on function public.apply_provider_conversion(text,text,uuid,uuid,public.conversion_status,numeric,numeric,jsonb) from public;
revoke all on function public.get_provider_webhook_secret(text) from public;
revoke all on function public.record_webhook_event(uuid,text,boolean,jsonb) from public;
revoke all on function public.admin_dashboard_metrics() from public;

grant execute on function public.start_task(uuid) to authenticated;
grant execute on function public.request_withdrawal(numeric,uuid,text) to authenticated;
grant execute on function public.cancel_withdrawal(uuid) to authenticated;
grant execute on function public.review_withdrawal(uuid,text,text,text) to authenticated;
grant execute on function public.create_support_ticket(text,text,text,uuid,uuid) to authenticated;
grant execute on function public.admin_dashboard_metrics() to authenticated;
grant execute on function public.apply_provider_conversion(text,text,uuid,uuid,public.conversion_status,numeric,numeric,jsonb) to service_role;
grant execute on function public.get_provider_webhook_secret(text) to service_role;
grant execute on function public.record_webhook_event(uuid,text,boolean,jsonb) to service_role;

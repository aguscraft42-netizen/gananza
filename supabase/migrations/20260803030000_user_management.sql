-- Migration: User management administrative RPCs and audit logging
create or replace function public.manage_user_status(
  p_target_user_id uuid,
  p_action text,
  p_reason text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_is_admin boolean;
  v_profile public.profiles;
  v_action_clean text := lower(trim(p_action));
  v_reason_clean text := nullif(trim(p_reason), '');
  v_before_data jsonb;
begin
  if v_actor_id is null then
    raise exception 'Autenticación requerida' using errcode = '42501';
  end if;

  select exists (
    select 1 from public.user_roles
    where user_id = v_actor_id and role in ('admin', 'reviewer')
  ) into v_is_admin;

  if not v_is_admin then
    raise exception 'No posee permisos administrativos' using errcode = '42501';
  end if;

  select * into v_profile from public.profiles where id = p_target_user_id;
  if not found then
    raise exception 'Usuario no encontrado' using errcode = 'P0002';
  end if;

  v_before_data := jsonb_build_object(
    'suspended_at', v_profile.suspended_at,
    'suspension_reason', v_profile.suspension_reason
  );

  if v_action_clean = 'suspend' then
    if v_reason_clean is null then
      raise exception 'El motivo de suspensión es obligatorio.' using errcode = '22023';
    end if;

    update public.profiles
    set suspended_at = now(),
        suspension_reason = v_reason_clean,
        updated_at = now()
    where id = p_target_user_id
    returning * into v_profile;

    insert into public.audit_logs (
      actor_id, action, entity_type, entity_id, before_data, after_data
    ) values (
      v_actor_id,
      'user_suspended',
      'profiles',
      p_target_user_id::text,
      v_before_data,
      jsonb_build_object('suspended_at', v_profile.suspended_at, 'suspension_reason', v_reason_clean)
    );

  elsif v_action_clean = 'reactivate' then
    update public.profiles
    set suspended_at = null,
        suspension_reason = null,
        updated_at = now()
    where id = p_target_user_id
    returning * into v_profile;

    insert into public.audit_logs (
      actor_id, action, entity_type, entity_id, before_data, after_data
    ) values (
      v_actor_id,
      'user_reactivated',
      'profiles',
      p_target_user_id::text,
      v_before_data,
      jsonb_build_object('suspended_at', null, 'suspension_reason', null)
    );
  else
    raise exception 'Acción no válida' using errcode = '22023';
  end if;

  return v_profile;
end;
$$;

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pgtap;
select plan(20);

select ok((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass), 'profiles has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.offers'::regclass), 'offers has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.task_sessions'::regclass), 'task_sessions has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.conversions'::regclass), 'conversions has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.wallets'::regclass), 'wallets has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.ledger_entries'::regclass), 'ledger has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.payout_methods'::regclass), 'payout methods has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.withdrawals'::regclass), 'withdrawals has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.support_tickets'::regclass), 'tickets has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.fraud_flags'::regclass), 'fraud flags has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.audit_logs'::regclass), 'audit logs has RLS');

select ok(has_table_privilege('authenticated', 'public.wallets', 'SELECT'), 'users may read wallet through RLS');
select ok(not has_table_privilege('authenticated', 'public.wallets', 'UPDATE'), 'users cannot update wallet');
select ok(not has_table_privilege('authenticated', 'public.ledger_entries', 'INSERT'), 'users cannot insert ledger entries');
select ok(not has_table_privilege('authenticated', 'public.conversions', 'INSERT'), 'users cannot create conversions');
select ok(not has_table_privilege('authenticated', 'public.withdrawals', 'INSERT'), 'users cannot bypass withdrawal RPC');
select ok(has_function_privilege('authenticated', 'public.request_withdrawal(numeric,uuid,text)', 'EXECUTE'), 'authenticated may call withdrawal RPC');
select ok(not has_function_privilege('authenticated', 'public.apply_provider_conversion(text,text,uuid,uuid,public.conversion_status,numeric,numeric,jsonb)', 'EXECUTE'), 'users cannot apply conversions');
select ok(has_function_privilege('service_role', 'public.apply_provider_conversion(text,text,uuid,uuid,public.conversion_status,numeric,numeric,jsonb)', 'EXECUTE'), 'service role may apply conversions');
select ok(has_schema_privilege('authenticated', 'private', 'USAGE'), 'users can resolve protected helper functions');

select * from finish();
rollback;

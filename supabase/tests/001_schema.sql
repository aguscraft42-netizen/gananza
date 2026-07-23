begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pgtap;
select plan(26);

select has_table('public', 'profiles', 'profiles exists');
select has_table('public', 'user_roles', 'user_roles exists');
select has_table('public', 'providers', 'providers exists');
select has_table('public', 'offers', 'offers exists');
select has_table('public', 'task_sessions', 'task_sessions exists');
select has_table('public', 'conversions', 'conversions exists');
select has_table('public', 'wallets', 'wallets exists');
select has_table('public', 'ledger_entries', 'ledger_entries exists');
select has_table('public', 'payout_methods', 'payout_methods exists');
select has_table('public', 'withdrawals', 'withdrawals exists');
select has_table('public', 'withdrawal_events', 'withdrawal_events exists');
select has_table('public', 'support_tickets', 'support_tickets exists');
select has_table('public', 'support_messages', 'support_messages exists');
select has_table('public', 'devices', 'devices exists');
select has_table('public', 'fraud_flags', 'fraud_flags exists');
select has_table('public', 'audit_logs', 'audit_logs exists');
select has_table('private', 'provider_credentials', 'provider credentials are private');
select has_table('private', 'webhook_events', 'webhook events are private');

select ok(to_regprocedure('public.start_task(uuid)') is not null, 'start_task RPC exists');
select ok(to_regprocedure('public.request_withdrawal(numeric,uuid,text)') is not null, 'request_withdrawal RPC exists');
select ok(to_regprocedure('public.cancel_withdrawal(uuid)') is not null, 'cancel_withdrawal RPC exists');
select ok(to_regprocedure('public.review_withdrawal(uuid,text,text,text,text,text)') is not null, 'review_withdrawal RPC exists');
select ok(to_regprocedure('public.create_support_ticket(text,text,text,uuid,uuid)') is not null, 'support RPC exists');
select ok(to_regprocedure('public.apply_provider_conversion(text,text,uuid,uuid,public.conversion_status,numeric,numeric,jsonb)') is not null, 'conversion RPC exists');
select ok(to_regprocedure('public.get_provider_webhook_secret(text)') is not null, 'webhook secret RPC exists');
select ok(to_regprocedure('public.admin_dashboard_metrics()') is not null, 'admin metrics RPC exists');

select * from finish();
rollback;

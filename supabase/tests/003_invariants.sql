begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pgtap;
select plan(8);

select col_is_pk('public', 'wallets', 'user_id', 'one wallet per user');
select col_not_null('public', 'withdrawals', 'idempotency_key', 'withdrawals require idempotency');
select col_not_null('public', 'ledger_entries', 'idempotency_key', 'ledger requires idempotency');
select ok(exists(select 1 from pg_indexes where schemaname='public' and indexname='payout_methods_one_default_idx'), 'one default payout method index exists');
select ok(exists(select 1 from pg_trigger where tgname='ledger_entries_immutable'), 'ledger immutability trigger exists');
select ok(exists(select 1 from pg_trigger where tgname='audit_logs_immutable'), 'audit immutability trigger exists');
select ok(exists(select 1 from pg_trigger where tgname='on_auth_user_created'), 'new users create profile and wallet');
select ok(exists(select 1 from pg_indexes where schemaname='public' and indexname='ledger_entries_user_idx'), 'ledger ownership index exists');

select * from finish();
rollback;

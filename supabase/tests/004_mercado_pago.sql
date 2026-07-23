begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pgtap;
select plan(10);

select has_column('public', 'payout_methods', 'holder_document', 'payout methods store holder document');
select has_column('public', 'payout_methods', 'destination_hash', 'payout methods store a destination fingerprint');
select has_column('public', 'payout_methods', 'cooldown_until', 'payout methods support a security cooldown');
select has_column('public', 'withdrawals', 'payout_snapshot', 'withdrawals snapshot payout details');
select has_column('public', 'withdrawals', 'payment_receipt_url', 'withdrawals support a receipt URL');
select has_column('public', 'withdrawals', 'payment_sent_at', 'withdrawals store payment time');
select ok(exists(select 1 from pg_trigger where tgname='payout_methods_prepare'), 'payout method normalization trigger exists');
select ok(exists(select 1 from pg_trigger where tgname='payout_methods_shared_destination'), 'shared destination fraud trigger exists');
select ok(exists(select 1 from pg_indexes where schemaname='public' and indexname='withdrawals_one_active_per_user_idx'), 'only one active withdrawal is allowed per user');
select has_function('public', 'review_withdrawal', array['uuid','text','text','text','text','text'], 'review function accepts transfer evidence');

select * from finish();
rollback;

create schema if not exists reporting;

create or replace view reporting.transaction_detail as
select
	t.id,
	t.household_id,
	t.legacy_source_id,
	t.transaction_date,
	t.amount,
	t.transaction_type,
	ts.name as subtype_name,
	pm.name as payment_method_name,
	c.name as category_name,
	e.name as expensor_name,
	t.note,
	t.status,
	t.created_by,
	t.created_at,
	t.updated_at
from public.transactions t
join public.transaction_subtypes ts on ts.id = t.subtype_id
join public.payment_methods pm on pm.id = t.payment_method_id
join public.categories c on c.id = t.category_id
join public.expensors e on e.id = t.expensor_id;

create or replace view reporting.monthly_category_spending as
select
	t.household_id,
	date_trunc('month', t.transaction_date)::date as month_start,
	c.name as category_name,
	sum(t.amount) as total_amount
from public.transactions t
join public.categories c on c.id = t.category_id
where t.transaction_type = 'expense'
group by 1, 2, 3;

create or replace view reporting.monthly_cashflow as
select
	household_id,
	date_trunc('month', transaction_date)::date as month_start,
	sum(case when transaction_type = 'income' then amount else 0 end) as total_income,
	sum(case when transaction_type = 'expense' then amount else 0 end) as total_expense,
	sum(
		case
			when transaction_type = 'income' then amount
			when transaction_type = 'expense' then -amount
			else 0
		end
	) as net_cashflow
from public.transactions
group by 1, 2;

create or replace view reporting.uncategorized_transactions as
select *
from reporting.transaction_detail
where category_name is null;

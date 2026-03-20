-- Replace the household id below with the real household id for your account.
with household as (
	select '00000000-0000-0000-0000-000000000000'::uuid as household_id
)
insert into public.transaction_import_staging (
	household_id,
	legacy_source_id,
	transaction_date_raw,
	amount_raw,
	transaction_type_raw,
	subtype_raw,
	payment_method_raw,
	category_raw,
	expensor_raw
)
select
	household.household_id,
	values.legacy_source_id,
	values.transaction_date_raw,
	values.amount_raw,
	values.transaction_type_raw,
	values.subtype_raw,
	values.payment_method_raw,
	values.category_raw,
	values.expensor_raw
from household
cross join (
	values
		('1775', '1/12/2019', '$1,450.00', 'Income', '929 Kirts', 'Venmo', 'Rental Income', 'Shared'),
		('1776', '2/12/2019', '$1,450.00', 'Income', '929 Kirts', 'Venmo', 'Rental Income', 'Shared'),
		('1777', '3/12/2019', '$1,450.00', 'Income', '929 Kirts', 'Venmo', 'Rental Income', 'Shared')
) as values(
	legacy_source_id,
	transaction_date_raw,
	amount_raw,
	transaction_type_raw,
	subtype_raw,
	payment_method_raw,
	category_raw,
	expensor_raw
);

with staged as (
	select
		s.household_id,
		s.legacy_source_id,
		to_date(s.transaction_date_raw, 'MM/DD/YYYY') as transaction_date,
		replace(replace(s.amount_raw, '$', ''), ',', '')::numeric(12, 2) as amount,
		lower(trim(s.transaction_type_raw)) as transaction_type,
		ts.id as subtype_id,
		pm.id as payment_method_id,
		c.id as category_id,
		e.id as expensor_id
	from public.transaction_import_staging s
	join public.transaction_subtypes ts
		on ts.household_id = s.household_id
		and ts.name = s.subtype_raw
	join public.payment_methods pm
		on pm.household_id = s.household_id
		and pm.name = s.payment_method_raw
	join public.categories c
		on c.household_id = s.household_id
		and c.name = s.category_raw
	join public.expensors e
		on e.household_id = s.household_id
		and e.name = s.expensor_raw
)
insert into public.transactions (
	household_id,
	legacy_source_id,
	transaction_date,
	amount,
	transaction_type,
	subtype_id,
	payment_method_id,
	category_id,
	expensor_id,
	status
)
select
	household_id,
	legacy_source_id,
	transaction_date,
	amount,
	transaction_type,
	subtype_id,
	payment_method_id,
	category_id,
	expensor_id,
	'complete'
from staged
on conflict (household_id, legacy_source_id) do nothing;

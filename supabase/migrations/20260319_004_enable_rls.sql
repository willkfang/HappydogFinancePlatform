alter table public.households enable row level security;
alter table public.household_users enable row level security;
alter table public.expensors enable row level security;
alter table public.payment_methods enable row level security;
alter table public.transaction_subtypes enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

create or replace function public.is_household_member(target_household_id uuid)
returns boolean
language sql
stable
as $$
	select exists (
		select 1
		from public.household_users hu
		where hu.household_id = target_household_id
			and hu.user_id = auth.uid()
	);
$$;

create policy "household members can read households"
on public.households
for select
using (public.is_household_member(id));

create policy "household members can read household_users"
on public.household_users
for select
using (public.is_household_member(household_id));

create policy "household members can read expensors"
on public.expensors
for select
using (public.is_household_member(household_id));

create policy "household members can read payment methods"
on public.payment_methods
for select
using (public.is_household_member(household_id));

create policy "household members can read transaction subtypes"
on public.transaction_subtypes
for select
using (public.is_household_member(household_id));

create policy "household members can read categories"
on public.categories
for select
using (public.is_household_member(household_id));

create policy "household members can read transactions"
on public.transactions
for select
using (public.is_household_member(household_id));

create policy "household members can insert transactions"
on public.transactions
for insert
with check (public.is_household_member(household_id));

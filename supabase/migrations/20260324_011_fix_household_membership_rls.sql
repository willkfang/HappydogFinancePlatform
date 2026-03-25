drop policy if exists "household members can read household_users" on public.household_users;

create policy "users can read their own household memberships"
on public.household_users
for select
using (user_id = auth.uid());

create or replace function public.is_household_member(target_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
	select exists (
		select 1
		from public.household_users hu
		where hu.household_id = target_household_id
			and hu.user_id = auth.uid()
	);
$$;

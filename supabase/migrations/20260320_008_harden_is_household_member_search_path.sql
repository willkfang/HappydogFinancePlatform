create or replace function public.is_household_member(target_household_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
	select exists (
		select 1
		from public.household_users hu
		where hu.household_id = target_household_id
			and hu.user_id = auth.uid()
	);
$$;

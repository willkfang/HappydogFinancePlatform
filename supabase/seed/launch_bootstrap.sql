-- Launch bootstrap
-- 1. Replace the emails below with your real Supabase Auth users.
-- 2. Run this after the migrations and before reference_dimensions.sql.

with created_household as (
	insert into public.households (name)
	values ('Happy Dog Household')
	on conflict (name) do update set name = excluded.name
	returning id
),
target_household as (
	select id from created_household
	union all
	select id from public.households where name = 'Happy Dog Household'
	limit 1
)
insert into public.household_users (household_id, user_id, role)
select target_household.id, auth_users.id, 'owner'
from target_household
join auth.users as auth_users
	on auth_users.email in ('replace-j@example.com', 'replace-w@example.com')
on conflict (household_id, user_id) do nothing;

select id, name
from public.households
where name = 'Happy Dog Household';

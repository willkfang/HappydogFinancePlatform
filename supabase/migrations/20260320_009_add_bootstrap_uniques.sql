alter table public.households
	add constraint households_name_key unique (name);

alter table public.household_users
	add constraint household_users_household_id_user_id_key unique (household_id, user_id);

create table if not exists public.households (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	created_at timestamptz not null default now()
);

create table if not exists public.household_users (
	id uuid primary key default gen_random_uuid(),
	household_id uuid not null references public.households(id) on delete cascade,
	user_id uuid not null,
	role text not null default 'member',
	created_at timestamptz not null default now()
);

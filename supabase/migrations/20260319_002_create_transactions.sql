create extension if not exists pgcrypto;

create table if not exists public.expensors (
	id uuid primary key default gen_random_uuid(),
	household_id uuid not null references public.households(id) on delete cascade,
	name text not null,
	created_at timestamptz not null default now(),
	unique (household_id, name)
);

create table if not exists public.payment_methods (
	id uuid primary key default gen_random_uuid(),
	household_id uuid not null references public.households(id) on delete cascade,
	name text not null,
	created_at timestamptz not null default now(),
	unique (household_id, name)
);

create table if not exists public.transaction_subtypes (
	id uuid primary key default gen_random_uuid(),
	household_id uuid not null references public.households(id) on delete cascade,
	name text not null,
	created_at timestamptz not null default now(),
	unique (household_id, name)
);

create table if not exists public.categories (
	id uuid primary key default gen_random_uuid(),
	household_id uuid not null references public.households(id) on delete cascade,
	name text not null,
	parent_category_id uuid references public.categories(id) on delete set null,
	is_active boolean not null default true,
	created_at timestamptz not null default now(),
	unique (household_id, name)
);

create table if not exists public.transactions (
	id uuid primary key default gen_random_uuid(),
	household_id uuid not null references public.households(id) on delete cascade,
	legacy_source_id text,
	transaction_date date not null,
	amount numeric(12, 2) not null check (amount > 0),
	transaction_type text not null check (transaction_type in ('expense', 'income', 'transfer', 'adjustment')),
	subtype_id uuid not null references public.transaction_subtypes(id),
	payment_method_id uuid not null references public.payment_methods(id),
	category_id uuid not null references public.categories(id),
	expensor_id uuid not null references public.expensors(id),
	note text not null default '',
	status text not null default 'review' check (status in ('draft', 'review', 'complete')),
	created_by uuid,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (household_id, legacy_source_id)
);

create index if not exists transactions_household_date_idx
	on public.transactions (household_id, transaction_date desc);

create index if not exists transactions_category_idx
	on public.transactions (category_id);

create index if not exists transactions_payment_method_idx
	on public.transactions (payment_method_id);

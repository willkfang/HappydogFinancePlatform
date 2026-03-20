create table if not exists public.properties (
	id uuid primary key default gen_random_uuid(),
	household_id uuid not null references public.households(id) on delete cascade,
	name text not null,
	property_kind text not null default 'rental',
	is_active boolean not null default true,
	created_at timestamptz not null default timezone('utc', now()),
	unique (household_id, name)
);

create table if not exists public.transaction_reporting_profiles (
	id uuid primary key default gen_random_uuid(),
	household_id uuid not null references public.households(id) on delete cascade,
	category_name text not null,
	scope text not null,
	lifecycle text not null,
	essentiality text not null,
	property_id uuid references public.properties(id) on delete set null,
	annualized boolean not null default false,
	created_at timestamptz not null default timezone('utc', now()),
	unique (household_id, category_name)
);

create table if not exists public.budget_targets (
	id uuid primary key default gen_random_uuid(),
	household_id uuid not null references public.households(id) on delete cascade,
	category_name text not null,
	scope text not null,
	target_amount numeric(12, 2) not null,
	period text not null default 'monthly',
	annualized boolean not null default false,
	created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.household_financial_profiles (
	id uuid primary key default gen_random_uuid(),
	household_id uuid not null unique references public.households(id) on delete cascade,
	current_age integer,
	partner_current_age integer,
	retirement_age integer,
	partner_retirement_age integer,
	current_retirement_balance numeric(14, 2),
	current_taxable_balance numeric(14, 2),
	current_cash_reserves numeric(14, 2),
	current_debt_balance numeric(14, 2),
	annual_earned_income numeric(14, 2),
	annual_rental_net_income numeric(14, 2),
	annual_retirement_contribution numeric(14, 2),
	employer_match numeric(14, 2),
	inflation_rate numeric(6, 4),
	return_rate numeric(6, 4),
	income_growth_rate numeric(6, 4),
	retirement_spending_target numeric(14, 2),
	withdrawal_rate numeric(6, 4),
	planning_end_age integer,
	include_rental_in_plan boolean not null default true,
	created_at timestamptz not null default timezone('utc', now()),
	updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.retirement_scenarios (
	id uuid primary key default gen_random_uuid(),
	household_id uuid not null references public.households(id) on delete cascade,
	name text not null,
	scenario_kind text not null default 'deterministic',
	assumption_payload jsonb not null,
	created_at timestamptz not null default timezone('utc', now())
);

create schema if not exists planning;

create or replace view planning.household_budget_targets as
select
	bt.household_id,
	bt.category_name,
	bt.scope,
	bt.target_amount,
	bt.period,
	bt.annualized
from public.budget_targets bt;

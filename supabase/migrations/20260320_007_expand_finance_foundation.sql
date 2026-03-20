create table if not exists public.accounts (
	id uuid primary key default gen_random_uuid(),
	household_id uuid not null references public.households(id) on delete cascade,
	name text not null,
	account_kind text not null default 'checking',
	institution_name text not null default '',
	is_active boolean not null default true,
	created_at timestamptz not null default timezone('utc', now()),
	unique (household_id, name)
);

create table if not exists public.merchants (
	id uuid primary key default gen_random_uuid(),
	household_id uuid not null references public.households(id) on delete cascade,
	normalized_name text not null,
	is_active boolean not null default true,
	created_at timestamptz not null default timezone('utc', now()),
	unique (household_id, normalized_name)
);

alter table public.transactions
	add column if not exists account_id uuid references public.accounts(id) on delete set null,
	add column if not exists merchant_id uuid references public.merchants(id) on delete set null,
	add column if not exists raw_merchant_name text not null default '';

alter table public.transactions alter column subtype_id drop not null;
alter table public.transactions alter column payment_method_id drop not null;
alter table public.transactions alter column category_id drop not null;
alter table public.transactions alter column expensor_id drop not null;

create table if not exists public.transaction_attachments (
	id uuid primary key default gen_random_uuid(),
	household_id uuid not null references public.households(id) on delete cascade,
	transaction_id uuid not null references public.transactions(id) on delete cascade,
	storage_bucket text not null default 'receipts',
	storage_path text not null,
	original_filename text,
	content_type text,
	uploaded_by uuid,
	created_at timestamptz not null default timezone('utc', now()),
	unique (transaction_id, storage_path)
);

create table if not exists public.transaction_reviews (
	id uuid primary key default gen_random_uuid(),
	household_id uuid not null references public.households(id) on delete cascade,
	transaction_id uuid not null references public.transactions(id) on delete cascade,
	review_status text not null default 'pending' check (review_status in ('pending', 'reviewed', 'flagged')),
	review_note text not null default '',
	reviewed_by uuid,
	reviewed_at timestamptz,
	created_at timestamptz not null default timezone('utc', now())
);

create index if not exists accounts_household_name_idx
	on public.accounts (household_id, name);

create index if not exists merchants_household_name_idx
	on public.merchants (household_id, normalized_name);

create index if not exists transactions_account_idx
	on public.transactions (account_id);

create index if not exists transactions_merchant_idx
	on public.transactions (merchant_id);

create index if not exists transaction_attachments_transaction_idx
	on public.transaction_attachments (transaction_id);

create index if not exists transaction_reviews_transaction_idx
	on public.transaction_reviews (transaction_id, review_status);

alter table public.transaction_import_staging enable row level security;
alter table public.properties enable row level security;
alter table public.transaction_reporting_profiles enable row level security;
alter table public.budget_targets enable row level security;
alter table public.household_financial_profiles enable row level security;
alter table public.retirement_scenarios enable row level security;
alter table public.accounts enable row level security;
alter table public.merchants enable row level security;
alter table public.transaction_attachments enable row level security;
alter table public.transaction_reviews enable row level security;

create policy "household members can update transactions"
on public.transactions
for update
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "household members can read import staging"
on public.transaction_import_staging
for select
using (public.is_household_member(household_id));

create policy "household members can insert import staging"
on public.transaction_import_staging
for insert
with check (public.is_household_member(household_id));

create policy "household members can read properties"
on public.properties
for select
using (public.is_household_member(household_id));

create policy "household members can insert properties"
on public.properties
for insert
with check (public.is_household_member(household_id));

create policy "household members can update properties"
on public.properties
for update
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "household members can read transaction reporting profiles"
on public.transaction_reporting_profiles
for select
using (public.is_household_member(household_id));

create policy "household members can insert transaction reporting profiles"
on public.transaction_reporting_profiles
for insert
with check (public.is_household_member(household_id));

create policy "household members can update transaction reporting profiles"
on public.transaction_reporting_profiles
for update
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "household members can read budget targets"
on public.budget_targets
for select
using (public.is_household_member(household_id));

create policy "household members can insert budget targets"
on public.budget_targets
for insert
with check (public.is_household_member(household_id));

create policy "household members can update budget targets"
on public.budget_targets
for update
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "household members can read household financial profiles"
on public.household_financial_profiles
for select
using (public.is_household_member(household_id));

create policy "household members can insert household financial profiles"
on public.household_financial_profiles
for insert
with check (public.is_household_member(household_id));

create policy "household members can update household financial profiles"
on public.household_financial_profiles
for update
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "household members can read retirement scenarios"
on public.retirement_scenarios
for select
using (public.is_household_member(household_id));

create policy "household members can insert retirement scenarios"
on public.retirement_scenarios
for insert
with check (public.is_household_member(household_id));

create policy "household members can update retirement scenarios"
on public.retirement_scenarios
for update
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "household members can read accounts"
on public.accounts
for select
using (public.is_household_member(household_id));

create policy "household members can insert accounts"
on public.accounts
for insert
with check (public.is_household_member(household_id));

create policy "household members can update accounts"
on public.accounts
for update
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "household members can read merchants"
on public.merchants
for select
using (public.is_household_member(household_id));

create policy "household members can insert merchants"
on public.merchants
for insert
with check (public.is_household_member(household_id));

create policy "household members can update merchants"
on public.merchants
for update
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "household members can read transaction attachments"
on public.transaction_attachments
for select
using (public.is_household_member(household_id));

create policy "household members can insert transaction attachments"
on public.transaction_attachments
for insert
with check (public.is_household_member(household_id));

create policy "household members can update transaction attachments"
on public.transaction_attachments
for update
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "household members can read transaction reviews"
on public.transaction_reviews
for select
using (public.is_household_member(household_id));

create policy "household members can insert transaction reviews"
on public.transaction_reviews
for insert
with check (public.is_household_member(household_id));

create policy "household members can update transaction reviews"
on public.transaction_reviews
for update
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

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
	t.updated_at,
	a.name as account_name,
	m.normalized_name as merchant_name,
	t.raw_merchant_name
from public.transactions t
left join public.transaction_subtypes ts on ts.id = t.subtype_id
left join public.payment_methods pm on pm.id = t.payment_method_id
left join public.categories c on c.id = t.category_id
left join public.expensors e on e.id = t.expensor_id
left join public.accounts a on a.id = t.account_id
left join public.merchants m on m.id = t.merchant_id;

create or replace view reporting.top_merchants as
select
	t.household_id,
	coalesce(nullif(m.normalized_name, ''), nullif(t.raw_merchant_name, ''), '(unmapped)') as merchant_name,
	count(*) as transaction_count,
	sum(t.amount) as total_amount
from public.transactions t
left join public.merchants m on m.id = t.merchant_id
where t.transaction_type = 'expense'
group by 1, 2;

create or replace view reporting.uncategorized_transactions as
select *
from reporting.transaction_detail
where category_name is null;

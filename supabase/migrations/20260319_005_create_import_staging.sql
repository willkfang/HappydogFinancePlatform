create table if not exists public.transaction_import_staging (
	id bigserial primary key,
	household_id uuid not null references public.households(id) on delete cascade,
	legacy_source_id text,
	transaction_date_raw text not null,
	amount_raw text not null,
	transaction_type_raw text not null,
	subtype_raw text not null,
	payment_method_raw text not null,
	category_raw text not null,
	expensor_raw text not null,
	note_raw text not null default '',
	imported_at timestamptz not null default now()
);

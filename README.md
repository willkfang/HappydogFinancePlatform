# Happy Dog Finance Platform

Private household finance app built with:

- SvelteKit
- Tailwind CSS v4
- shadcn-svelte
- Supabase
- Postgres
- Vercel deployment target

## Local development

```sh
npm install
npm run dev
```

## Required environment variables

Copy `.env.example` to `.env` and set:

```sh
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
```

The current app only requires the two public values for runtime. `SUPABASE_SERVICE_ROLE_KEY` is optional and reserved for future privileged import/admin work.

## Verification

```sh
npm run lint
npm run check
npm run build
npm test
```

## Database setup

Run the SQL files in [supabase/migrations](/C:/Users/taiwa/HappyDogFinancePlatform/supabase/migrations) in order.

Then:

1. Create your Supabase Auth users in the dashboard.
2. Run [launch_bootstrap.sql](/C:/Users/taiwa/HappyDogFinancePlatform/supabase/seed/launch_bootstrap.sql) after replacing the placeholder emails.
3. Run [reference_dimensions.sql](/C:/Users/taiwa/HappyDogFinancePlatform/supabase/seed/reference_dimensions.sql) after replacing the placeholder household UUID with the household ID created in step 2.

For migration rehearsal, use [sample_legacy_transactions.sql](/C:/Users/taiwa/HappyDogFinancePlatform/supabase/seed/sample_legacy_transactions.sql).

## Deployment

Deployment is documented in [vercel-release.md](/C:/Users/taiwa/HappyDogFinancePlatform/docs/release/vercel-release.md).

## Sign-in flow

After deployment, users sign in at `/login` with a Supabase Auth email/password account that is already present in `household_users`.

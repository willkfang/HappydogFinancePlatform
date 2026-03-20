# Vercel Release

## Target architecture

- Hosting: Vercel
- Database/Auth/Storage: Supabase
- Runtime: SvelteKit on `@sveltejs/adapter-vercel`

This app does have a backend. It is just split:

- Vercel runs the app and server-rendered routes
- Supabase runs the database, auth, and storage

## Launch sequence

### 1. Create the Supabase project

Create a hosted Supabase project and save:

- project URL
- anon/public key

### 2. Run the database migrations

Run these SQL files in order inside the Supabase SQL editor:

1. [20260319_001_create_households.sql](/C:/Users/taiwa/HappyDogFinancePlatform/supabase/migrations/20260319_001_create_households.sql)
2. [20260319_002_create_transactions.sql](/C:/Users/taiwa/HappyDogFinancePlatform/supabase/migrations/20260319_002_create_transactions.sql)
3. [20260319_003_create_reporting_views.sql](/C:/Users/taiwa/HappyDogFinancePlatform/supabase/migrations/20260319_003_create_reporting_views.sql)
4. [20260319_004_enable_rls.sql](/C:/Users/taiwa/HappyDogFinancePlatform/supabase/migrations/20260319_004_enable_rls.sql)
5. [20260319_005_create_import_staging.sql](/C:/Users/taiwa/HappyDogFinancePlatform/supabase/migrations/20260319_005_create_import_staging.sql)
6. [20260320_006_create_finance_planning_tables.sql](/C:/Users/taiwa/HappyDogFinancePlatform/supabase/migrations/20260320_006_create_finance_planning_tables.sql)
7. [20260320_007_expand_finance_foundation.sql](/C:/Users/taiwa/HappyDogFinancePlatform/supabase/migrations/20260320_007_expand_finance_foundation.sql)
8. [20260320_008_harden_is_household_member_search_path.sql](/C:/Users/taiwa/HappyDogFinancePlatform/supabase/migrations/20260320_008_harden_is_household_member_search_path.sql)
9. [20260320_009_add_bootstrap_uniques.sql](/C:/Users/taiwa/HappyDogFinancePlatform/supabase/migrations/20260320_009_add_bootstrap_uniques.sql)

### 3. Create the real auth users

In Supabase Auth:

1. Open `Authentication -> Users`.
2. Create the real user accounts you want to use in production.
3. Set passwords for those users.
4. If email confirmation is enabled, confirm the users or create them as confirmed users.

The app signs in with email/password at `/login`.

### 4. Bootstrap the household membership

Open [launch_bootstrap.sql](/C:/Users/taiwa/HappyDogFinancePlatform/supabase/seed/launch_bootstrap.sql).

Before running it:

- replace `replace-j@example.com`
- replace `replace-w@example.com`
- optionally change the household name

Then run it. This creates the household row and the `household_users` mappings.

### 5. Seed the reference dimensions

Open [reference_dimensions.sql](/C:/Users/taiwa/HappyDogFinancePlatform/supabase/seed/reference_dimensions.sql).

Before running it:

- copy the household ID produced by step 4
- replace the placeholder UUID in the file with that real household ID

Then run the file. This seeds:

- transaction subtypes
- payment methods
- expensors
- categories

### 6. Rehearse or import historical data

For a rehearsal, run [sample_legacy_transactions.sql](/C:/Users/taiwa/HappyDogFinancePlatform/supabase/seed/sample_legacy_transactions.sql) after replacing the placeholder UUID with the same household ID.

For the real migration, use that file as the template for your legacy import process:

- load rows into `transaction_import_staging`
- transform and insert into `transactions`

### 7. Push the project to Git

Push the codebase to GitHub, GitLab, or Bitbucket so Vercel can import it.

### 8. Import the repo into Vercel

In Vercel:

1. Create a new project from the repo.
2. Let Vercel detect the framework.
3. Keep the default root directory unless you move the app later.
4. Keep the default install/build commands.

Expected commands:

- Install: `npm install`
- Build: `npm run build`

### 9. Add Vercel environment variables

In `Project Settings -> Environment Variables`, add:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

Add them for:

- Production
- Preview
- Development

Do not expose:

- `SUPABASE_SERVICE_ROLE_KEY`

Only add the service role key later if you create a server-only import/admin path that explicitly needs it.

### 10. Deploy and sign in

Deploy the project.

After deployment:

1. Open the Vercel URL.
2. Go to `/login`.
3. Sign in with one of the users created in step 3.
4. Confirm that the dashboard, quick add, and transactions pages load real household data.

## Environment values

- `.env.example` contains the expected local variable names.
- In Vercel, only the two `PUBLIC_` variables are required for this release.

## Release checklist

Before marking the release live:

1. `npm run lint`
2. `npm run check`
3. `npm run build`
4. `npm test`
5. Vercel env vars configured
6. Supabase migrations applied
7. Supabase Auth users created
8. Household bootstrap run
9. Reference dimensions seeded
10. Login succeeds at `/login`
11. Quick Add writes a real transaction

## Local Windows note

`npm run build` currently completes the SvelteKit build but can fail during the Vercel adapter step on Windows with:

- `EPERM: operation not permitted, symlink ... .vercel/output/functions`

That is a local filesystem permission issue around Vercel output symlinks. The cloud Vercel build is still the real release path.

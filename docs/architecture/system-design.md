# System Design

## Purpose

This document translates the product plan into an implementation architecture for the current stack:

- SvelteKit
- Tailwind CSS v4
- shadcn-svelte
- Supabase
- Postgres

The system should feel lightweight in code and serious in data handling.

## Final architecture decisions

### 1. Client platform

Decision:

Use a responsive web app first.

Architect view:

- One codebase reduces delivery overhead.
- Quick Add and admin workflows can share domain logic.
- The browser is sufficient for the first serious version of this product.

Skeptic view:

- Web is only acceptable if the mobile flow is genuinely fast.
- Do not hide mediocre mobile UX behind "responsive design" language.
- If latency or layout friction appears, adoption will drop.

Implementation rule:

Optimize the UI for phone entry first, desktop correction second, and avoid native app work in phase 1.

### 2. Frontend stack

Decision:

Use SvelteKit with Tailwind and shadcn-svelte.

Architect view:

- SvelteKit keeps the codebase lean for a small product.
- Tailwind plus shadcn-svelte gives a strong UI baseline without the weight of a larger React admin stack.
- Svelte files are a good fit for route-driven screens and low-ceremony interactions.

Skeptic view:

- Svelte is not magic; the project still fails if shared rules are scattered.
- Tailwind can become unreadable if class usage gets sloppy.
- shadcn-svelte should be treated as primitives, not as a substitute for product design.

Implementation rule:

Use shadcn-svelte for UI primitives, keep route files thin, and centralize domain rules outside view components.

### 3. Backend platform

Decision:

Use Supabase for Auth, Postgres, Storage, and operational convenience.

Architect view:

- It removes backend plumbing work.
- It aligns well with a trusted small-user product.
- It lets the app focus on domain workflows rather than infrastructure.

Skeptic view:

- Convenience can lead to domain logic leaking into components or random helpers.
- RLS mistakes are easy to make if the SQL layer is not reviewed carefully.
- The app should not become "whatever the Supabase client happens to do."

Implementation rule:

Use Supabase for infrastructure primitives, but keep business rules in domain modules and SQL constraints.

### 4. Data and reporting

Decision:

Use normalized write tables and explicit reporting views.

Architect view:

- This keeps reporting trustworthy.
- It allows correction workflows without corrupting historical meaning.
- It preserves auditability.

Skeptic view:

- Do not let normalization become theoretical purity.
- The schema should support real entry speed, not just beautiful diagrams.
- Only add tables and views that support an actual workflow.

Implementation rule:

Write to operational tables in `public`, expose reports through `reporting` views, and keep finance logic out of frontend-only calculations.

### 5. Workflow model

Decision:

Use separate Quick Add and Admin Grid surfaces, with deferred enrichment allowed.

Architect view:

- These are different jobs.
- Quick Add should optimize for speed.
- Admin Grid should optimize for cleanup leverage.

Skeptic view:

- Two surfaces only make sense if shared validation and types stay centralized.
- If corrections become harder than the old spreadsheet, the architecture has missed the point.
- The admin surface should be powerful, not bloated.

Implementation rule:

Use one domain model and multiple workflow surfaces. UX differs by context; transaction meaning does not.

## Current application layers

### 1. Routes layer

Responsibility:

- URL structure
- shell composition
- top-level page assembly

Current examples:

- `src/routes/(app)/+page.svelte`
- `src/routes/(app)/quick-add/+page.svelte`
- `src/routes/(app)/transactions/+page.svelte`
- `src/routes/(app)/admin/+page.svelte`
- `src/routes/(app)/reports/+page.svelte`

Rule:

Route files should import feature screens and little else.

### 2. Features layer

Responsibility:

- workflow-specific UI
- screen composition
- feature-level interaction logic

Current examples:

- `src/lib/features/dashboard/DashboardOverview.svelte`
- `src/lib/features/quick-add/QuickAddScreen.svelte`
- `src/lib/features/transactions/TransactionsScreen.svelte`
- `src/lib/features/admin/AdminScreen.svelte`
- `src/lib/features/reports/ReportsScreen.svelte`

Rule:

If logic belongs to one workflow, keep it in the feature.

### 3. Shared component layer

Responsibility:

- app shell
- navigation
- reusable UI primitives

Current examples:

- `src/lib/components/app/AppShell.svelte`
- `src/lib/components/app/AppNav.svelte`
- `src/lib/components/ui/button/button.svelte`
- `src/lib/components/ui/card/card.svelte`

Rule:

Only promote code here when more than one feature needs it.

### 4. Domain layer

Responsibility:

- transaction types
- validation schemas
- business vocabulary

Current examples:

- `src/lib/domain/transactions/transaction.types.ts`
- `src/lib/domain/transactions/transaction.schema.ts`

Rule:

The domain layer should not depend on UI components or route structure.

### 5. Server/data layer

Responsibility:

- data access
- mock data today
- Supabase integration next

Current examples:

- `src/lib/server/mock/transactions.ts`

Future examples:

- `src/lib/server/supabase/client.ts`
- `src/lib/server/transactions/transaction.queries.ts`
- `src/lib/server/transactions/transaction.mutations.ts`

Rule:

Database access should move into this layer, not into components.

## File naming rules

### Svelte components

- use PascalCase for screen and shared component files
- match the file name to the primary component

Examples:

- `QuickAddScreen.svelte`
- `AppShell.svelte`
- `TransactionsScreen.svelte`

### Domain and server modules

- use lowercase dot-suffixed names for non-component modules
- use noun-first naming by domain

Examples:

- `transaction.types.ts`
- `transaction.schema.ts`
- `transaction.queries.ts`
- `transaction.mutations.ts`

### Folders

- use lowercase kebab-case for feature and route folders

Examples:

- `src/lib/features/quick-add`
- `src/routes/(app)/quick-add`

## Data flow

The intended transaction save flow is:

1. Quick Add screen captures a minimal payload.
2. Feature code maps it into a typed input object.
3. Domain schema validates it.
4. Server-side mutation writes it to Supabase/Postgres.
5. Postgres constraints and RLS enforce correctness and access.
6. The UI returns a success state and allows immediate correction.

Architect view:

- This preserves both speed and correctness.

Skeptic view:

- If the same validation rule appears separately in three places, refactor it.

## Database structure

Planned operational objects:

- `public.households`
- `public.household_users`
- `public.accounts`
- `public.categories`
- `public.merchants`
- `public.transactions`
- `public.transaction_attachments`
- `public.transaction_reviews`

Planned reporting objects:

- `reporting.monthly_category_spending`
- `reporting.monthly_cashflow`
- `reporting.top_merchants`
- `reporting.uncategorized_transactions`

Architect view:

- `public` is for writes, `reporting` is for read models.

Skeptic view:

- Keep phase 1 reporting views lean and useful.

## Clean-code and DRY guardrails

### Centralize

- domain schemas
- transaction types
- Supabase client construction
- app shell layout primitives
- formatting helpers with clear reuse

### Do not over-centralize

- one-off feature markup
- premature generic data grid helpers
- giant utility files
- abstract "manager" modules without a clear domain meaning

Architect check:

- Centralize invariants.

Skeptic check:

- Prefer small duplication over bad abstraction while workflows are still being discovered.

## Immediate next implementation steps

### Step 1

Complete the Supabase integration layer and environment parsing.

Architect:

- Establish trust boundaries early.

Skeptic:

- Keep the setup boring and explicit.

### Step 2

Replace mock Quick Add with a real end-to-end transaction save.

Architect:

- Validate the most important workflow vertically.

Skeptic:

- If the save path is not fast and robust, nothing else matters.

### Step 3

Build the first admin transaction grid using shared domain types.

Architect:

- This proves the dual-surface model.

Skeptic:

- Keep v1 shallow. Bulk usefulness matters more than exotic controls.

# Code Organization

## Intent

This codebase uses SvelteKit with a feature-first structure inside `src/lib` and route entrypoints inside `src/routes`.

The organization should support:

- thin routes
- reusable workflow screens
- explicit domain rules
- easy Supabase integration
- clean code without abstraction theatre

## Root layout

```text
.
|-- docs/
|   `-- architecture/
|-- src/
|   |-- lib/
|   |-- routes/
|   |-- app.d.ts
|   `-- app.html
|-- static/
|-- supabase/
|   |-- migrations/
|   `-- seed/
|-- components.json
|-- package.json
|-- svelte.config.js
|-- tsconfig.json
`-- plan.md
```

Architect review:

- The root stays compact.

Skeptic review:

- Do not add root folders casually.

## `src/routes`

Purpose:

- route entrypoints
- route grouping
- page-level composition

Current structure:

```text
src/routes/
|-- (app)/
|   |-- +layout.svelte
|   |-- +page.svelte
|   |-- quick-add/
|   |   `-- +page.svelte
|   |-- transactions/
|   |   `-- +page.svelte
|   |-- admin/
|   |   `-- +page.svelte
|   |-- reports/
|   |   `-- +page.svelte
|   `-- settings/
|       `-- +page.svelte
|-- +layout.svelte
`-- layout.css
```

Rules:

- Route files compose features.
- Route files should not become the main home of business logic.

## `src/lib/features`

Purpose:

- workflow screens
- feature-scoped components
- feature-level orchestration

Current structure:

```text
src/lib/features/
|-- admin/
|   `-- AdminScreen.svelte
|-- dashboard/
|   `-- DashboardOverview.svelte
|-- quick-add/
|   `-- QuickAddScreen.svelte
|-- reports/
|   `-- ReportsScreen.svelte
`-- transactions/
    `-- TransactionsScreen.svelte
```

Planned expansion:

```text
src/lib/features/quick-add/
|-- QuickAddScreen.svelte
|-- components/
|   |-- AmountField.svelte
|   |-- CategoryShortcutChips.svelte
|   `-- MerchantAutocomplete.svelte
`-- state/
    `-- quick-add-form.svelte.ts
```

Architect review:

- Features own workflows, which keeps pages thin.

Skeptic review:

- Only split into subfolders when the feature is big enough to justify it.

## `src/lib/components`

Purpose:

- shared app-shell components
- shared UI building blocks
- shadcn-svelte primitives

Current structure:

```text
src/lib/components/
|-- app/
|   |-- AppNav.svelte
|   `-- AppShell.svelte
`-- ui/
    |-- badge/
    |-- button/
    |-- card/
    |-- input/
    |-- separator/
    `-- textarea/
```

Rules:

- Keep feature-specific markup out of shared components.
- Use `ui/` for shadcn-svelte primitives and `app/` for shell-level shared components.

## `src/lib/domain`

Purpose:

- business vocabulary
- validation
- cross-feature rules

Current structure:

```text
src/lib/domain/
`-- transactions/
    |-- transaction.schema.ts
    `-- transaction.types.ts
```

Planned expansion:

```text
src/lib/domain/
|-- accounts/
|   |-- account.schema.ts
|   `-- account.types.ts
|-- categories/
|   |-- category.schema.ts
|   `-- category.types.ts
|-- merchants/
|   |-- merchant-normalization.ts
|   `-- merchant.types.ts
`-- transactions/
    |-- transaction.schema.ts
    |-- transaction.types.ts
    `-- transaction.utils.ts
```

Rules:

- Keep domain modules UI-free.
- Prefer domain names over transport names.

## `src/lib/server`

Purpose:

- server-only access patterns
- Supabase clients
- queries and mutations
- mock data during scaffold stage

Current structure:

```text
src/lib/server/
`-- mock/
    `-- transactions.ts
```

Planned expansion:

```text
src/lib/server/
|-- supabase/
|   |-- client.ts
|   `-- server.ts
`-- transactions/
    |-- transaction.queries.ts
    `-- transaction.mutations.ts
```

Rules:

- Avoid querying Supabase directly from route markup.
- Keep server modules named by domain intent.

## `src/lib`

Purpose:

- infrastructure helpers and aliases rooted in `$lib`

Current important files:

- `src/lib/utils.ts`

Rules:

- `utils.ts` should contain only genuinely generic helpers.
- When helpers acquire domain meaning, move them into `domain/` or `server/`.

## Naming conventions

### Components

- PascalCase file names
- one primary component per file

Examples:

- `AppShell.svelte`
- `QuickAddScreen.svelte`
- `ReportsScreen.svelte`

### Modules

- lowercase names with dot suffixes

Examples:

- `transaction.schema.ts`
- `transaction.types.ts`
- `transaction.queries.ts`

### Route folders

- lowercase kebab-case

Examples:

- `quick-add`
- `transactions`
- `settings`

## Clean-code rules

- Prefer thin route files and feature screens over giant pages.
- Keep domain rules outside UI components.
- Use shared components only for real reuse.
- Keep `ui/` primitives boring and predictable.
- Keep Tailwind classes intentional; do not let large class strings become unstructured noise.

## DRY rules

- Share domain schemas instead of duplicating validation.
- Share shell layout and navigation.
- Do not generalize one-off feature markup.
- Prefer small local duplication to a vague abstraction with unclear ownership.

## Review checklist

Architect asks:

- Is each folder earning its existence?
- Are domain rules centralized in the right layer?
- Can a new route be added by composing existing layers cleanly?

Skeptic asks:

- Did we move this into shared code too early?
- Is this folder helping delivery, or just making the tree look sophisticated?
- If one workflow changes, does the structure absorb it cleanly?

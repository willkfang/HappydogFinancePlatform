# Implementation Roadmap

## Purpose

This document is the working plan for turning the current scaffold into a functioning household finance product.

It covers:

- every user-facing feature currently represented in the codebase
- what exists today
- what is missing
- how each feature should be implemented
- the test strategy for each feature
- the debt-reduction rules that should slow development down when necessary

This is intentionally opinionated. The goal is not fast surface-level progress. The goal is to make each feature correct, testable, and maintainable before the next layer lands.

## Current state summary

The project currently has:

- route structure for dashboard, quick add, transactions, admin, reports, planning, settings, and login
- a Supabase-backed transaction repository
- domain logic for transaction analytics and retirement/planning calculations
- placeholder UI for admin and settings
- partial live behavior for login and quick add
- unit and Playwright coverage for basic rendering and some domain logic

The project does not currently have:

- reliable onboarding for real household users
- complete happy-path login verification
- seeded production data required for the app to feel functional
- working transaction editing workflows
- working admin-grid workflows
- persisted settings, merchant normalization, accounts management, budgets, or planning assumptions
- end-to-end tests for real feature behavior

## Delivery rules

These rules apply to every feature below.

### 1. Red/Green/Refactor is mandatory

Every feature slice must be built in this order:

1. Red
   Write or extend a failing test that expresses the next behavior change.
2. Green
   Implement the smallest code change that makes the test pass.
3. Refactor
   Remove duplication, clarify naming, simplify control flow, and improve structure while keeping tests green.

No feature is considered implemented if it only has green UI behavior without tests.

### 2. Prefer vertical slices

Do not build a large abstraction layer before a real workflow uses it.

Preferred implementation shape:

- domain schema/type
- server query or mutation
- route action or load
- feature UI
- test coverage across the relevant layers

### 3. Reduce debt before adding surface area

If a feature requires:

- duplicated validation rules
- duplicated Supabase query shapes
- inconsistent naming across domain/server/UI
- ad hoc error handling
- placeholder data mixed with live data

then the debt must be removed during the same slice, even if feature velocity slows down.

### 4. Keep the app honest

A feature should never appear “available” when the underlying data or permissions are missing.

That means:

- no silent empty states for authorization failures
- no successful login that still yields unusable pages
- no placeholder UI pretending persistence exists
- no analytics derived from starter assumptions without clear labeling

## Cross-cutting foundation work

These are not optional. They unblock every feature.

### A. Authentication and household access foundation

Current state:

- Supabase auth is wired
- login now fails cleanly if the account has no `household_users` mapping
- the database still depends on manually created auth users and seed data

Needed:

- confirmed Supabase auth users for the two real users
- successful bootstrap of `households` and `household_users`
- seeded reference rows for categories, payment methods, subtypes, and expensors
- a documented “first-use” checklist that guarantees login works before UI testing begins

TDD slices:

- Red: failing unit test for “valid auth user without household mapping gets explicit failure”
- Green: enforce household membership check during login
- Refactor: centralize household access checks and remove duplicated auth assumptions

- Red: failing integration-style test for “mapped user reaches dashboard”
- Green: seed household and reference rows in a reproducible setup path
- Refactor: extract test fixture helpers for auth and seeded household state

### B. Repository and error-handling cleanup

Current state:

- repository methods throw raw errors in some paths
- route loads call repository methods directly
- there is no typed error model separating validation, auth, access, and infrastructure failures

Needed:

- shared application error model for auth, access, validation, and persistence failures
- route loads/actions that convert errors into explicit UI states
- no raw `.single()`-style failures leaking directly to page behavior

TDD slices:

- Red: failing unit tests around unmapped user, missing references, and save failures
- Green: add typed error translation in repository/service layer
- Refactor: extract reusable error helpers and remove route-level branching duplication

### C. Test harness maturity

Current state:

- unit tests exist
- Playwright boots locally and basic render tests pass
- feature behavior is not covered end-to-end

Needed:

- seedable local test database strategy or a stable mocked auth/data harness
- Playwright coverage for login, quick add, transaction review, and report visibility
- a clear split between unit, integration, and e2e responsibilities

TDD slices:

- Red: failing Playwright test for real login flow
- Green: create predictable local seeded auth/data setup
- Refactor: centralize Playwright helpers, selectors, and login fixtures

## Feature roadmap

## 1. Login and session management

### Goal

Users can sign in, be rejected for the correct reason when setup is incomplete, and stay in a valid session through app navigation.

### Current state

- login form renders
- email/password sign-in is wired
- household membership is checked after sign-in
- logout exists

### Missing

- first-run guidance when auth users are missing
- stronger route-level behavior when session state is stale
- explicit UX for “auth exists but seed/setup incomplete”

### Needed implementation

- dedicated login error mapping for:
  - invalid credentials
  - household not linked
  - Supabase not configured
  - unexpected auth/provider failure
- session validation on app-shell entry
- a setup warning banner for partially configured environments

### Tests

- unit: login schema validation
- unit: auth service error translation
- e2e: invalid credentials show visible error
- e2e: mapped user reaches dashboard
- e2e: unmapped user remains on login with explicit message

### Debt checkpoints

- remove any duplicated auth checks between routes and services
- ensure route guards do not depend on page components knowing auth details

## 2. Dashboard

### Goal

The dashboard should show accurate, trustworthy summaries from live transaction data and clearly distinguish missing data from healthy empty states.

### Current state

- analytics cards and panels exist
- page reads live transactions
- empty states exist
- some display strings include mojibake (`â€¢`) and need cleanup

### Missing

- true error handling for failed data loads
- meaningful loading/empty/access states
- validation that displayed metrics match reporting assumptions

### Needed implementation

- server-side summary query strategy that is explicit and testable
- a dashboard view model rather than raw component shaping
- cleanup of display text encoding issues
- visible handling of “no household access” vs “no transactions”

### Tests

- unit: dashboard analytics from representative transaction fixtures
- integration: dashboard load for empty household
- e2e: dashboard reflects seeded transactions

### Debt checkpoints

- move view shaping out of Svelte components when logic grows
- remove raw display formatting duplication

## 3. Quick Add

### Goal

A user can save a transaction from a phone in seconds with strong validation, clear feedback, and no hidden setup assumptions.

### Current state

- form exists
- route action saves via repository
- validation exists
- reference suggestions come from Supabase

### Missing

- mobile-first polish and one-thumb ergonomics
- account and merchant support in the form
- deferred enrichment behavior for partial data
- duplicate prevention guidance
- receipt attachment path

### Needed implementation

- redesign the form around the actual minimum required fields
- add account and raw merchant capture
- define what can be optional at save-time
- add immediate success/reset behavior with “edit after save” affordance
- support household-aware defaults and recents

### Tests

- unit: quick-add schema and normalization rules
- integration: save success with full data
- integration: save success with allowed partial data
- e2e: user logs in and saves a transaction
- e2e: validation errors are visible and specific

### Debt checkpoints

- eliminate field-name translation drift between UI, domain, SQL, and seed files
- keep one canonical transaction input schema

## 4. Transactions review

### Goal

Users can browse recent transactions, understand what needs review, and make targeted corrections without the admin grid.

### Current state

- read-only list exists
- live transactions load

### Missing

- search
- filters
- row detail
- inline correction
- transaction review state management
- empty/error/access distinctions

### Needed implementation

- filterable query model
- transaction detail/edit mutation path
- review-state workflow using `transaction_reviews` or equivalent review markers
- optimistic or near-immediate update behavior after edit

### Tests

- unit: filter/query input normalization
- integration: transaction update mutation
- e2e: filter list by status/category/date
- e2e: edit a transaction and see the list update

### Debt checkpoints

- do not fork separate transaction types for “list rows” and “edit rows” unless justified
- centralize formatting and status semantics

## 5. Admin Grid

### Goal

The admin surface must provide true leverage for cleanup: bulk reassignment, merchant normalization, audit-friendly edits, and search.

### Current state

- placeholder screen only

### Missing

- everything functional

### Needed implementation

- paginated/grid query model
- selectable rows
- bulk category reassignment mutation
- merchant normalization workflow backed by `merchants` and `raw_merchant_name`
- audit metadata capture for review/edit actions
- high-signal keyboard and desktop interaction design

### Tests

- unit: merchant normalization rules
- integration: bulk update mutation with household scoping
- e2e: select rows and bulk-update category
- e2e: normalize merchant and verify reporting uses normalized name

### Debt checkpoints

- avoid building a giant generic grid abstraction before bulk-edit workflows are proven
- keep admin mutations explicit and auditable

## 6. Reports

### Goal

Reports should be driven by stable database views and clearly communicate category spend, cashflow, property performance, and budget variance.

### Current state

- report screen renders from in-memory finance insight calculations over loaded transactions
- planning/reporting concepts exist in domain code
- some intended reporting SQL views exist

### Missing

- alignment between SQL reporting views and UI calculations
- persisted budgets and reporting profiles feeding the UI
- merchant and account-level reporting
- clear drilldown paths

### Needed implementation

- decide which reports belong in SQL views vs domain code
- wire `budget_targets`, `transaction_reporting_profiles`, and `properties` into the reporting service
- build explicit report queries rather than relying on client-side aggregation of the currently loaded slice
- add report-level filters and timeframe selection

### Tests

- unit: finance insight calculations from fixtures
- integration: reporting service over seeded database rows
- e2e: report values visible for seeded household

### Debt checkpoints

- do not duplicate reporting logic in both SQL and frontend without a defined reason
- preserve one authoritative calculation path per metric

## 7. Planning

### Goal

Planning should move from starter assumptions in the browser to persisted household financial profiles and scenarios with transparent derivation.

### Current state

- planning screen exists
- deterministic and probabilistic calculations exist in domain code
- assumptions are local component state
- planning-related tables exist in Supabase

### Missing

- persistence of assumptions
- scenario CRUD
- linkage to actual household financial profile data
- history/versioning of planning runs

### Needed implementation

- planning service using `household_financial_profiles` and `retirement_scenarios`
- save/load mutation/query flows
- explicit separation between starter assumptions and persisted household assumptions
- scenario comparison UX tied to stored scenarios

### Tests

- unit: retirement engine calculations
- integration: save/load profile and scenario records
- e2e: edit assumptions, save them, reload, and verify persistence

### Debt checkpoints

- keep planning math pure and deterministic in domain code
- keep persistence and presentation separate from the math engine

## 8. Settings

### Goal

Settings should manage the shared reference data that the rest of the product depends on: accounts, categories, household metadata, and eventually users.

### Current state

- placeholder screen only

### Missing

- account management
- category management
- household metadata
- user/role visibility

### Needed implementation

- account CRUD for `accounts`
- category CRUD for `categories`
- household details view
- access-appropriate visibility into household members

### Tests

- integration: create/update/deactivate account
- integration: create/update category
- e2e: settings changes appear in quick-add suggestions

### Debt checkpoints

- no direct table editing from components
- no hidden coupling between settings labels and reporting logic

## 9. Historical import and reconciliation

### Goal

Existing AppSheet or spreadsheet history should be imported safely and audibly into the live schema.

### Current state

- staging table exists
- seed/template SQL exists

### Missing

- repeatable import procedure
- reconciliation checks
- duplicate handling
- rollback strategy

### Needed implementation

- import transformation scripts or SQL procedures
- reconciliation queries for counts and totals
- duplicate detection policy
- import runbook stored in docs

### Tests

- integration: staging-to-transaction transform against sample fixtures
- integration: duplicate import handling

### Debt checkpoints

- preserve raw imported fields until reconciliation is complete
- never mix ad hoc import logic into everyday transaction mutations

## 10. Receipts and attachments

### Goal

Users can attach receipt files to transactions and retrieve them later without confusing storage concerns with transaction semantics.

### Current state

- table exists
- UI and storage flow do not

### Missing

- storage bucket setup
- upload UI
- attachment listing
- access control verification

### Needed implementation

- create and document Supabase Storage bucket strategy
- upload flow for transaction attachments
- attachment metadata query and display
- deletion/replacement rules

### Tests

- integration: attachment metadata persistence
- e2e: upload and view an attachment

### Debt checkpoints

- do not store attachment URLs as free text inside transaction notes
- keep file storage details behind a dedicated attachment service

## 11. Merchant normalization

### Goal

Raw merchant text remains preserved, while normalized merchants improve reporting and cleanup workflows.

### Current state

- tables exist
- admin UI references the concept
- no actual behavior exists

### Missing

- raw merchant capture in quick add/import workflows
- normalization management UI
- reporting adoption of normalized names

### Needed implementation

- ensure new transactions can store `raw_merchant_name`
- build normalization mapping/edit workflow
- make reports prefer normalized merchant names with raw fallback

### Tests

- unit: normalization preference and fallback rules
- integration: updating `merchant_id` changes reporting output
- e2e: admin normalizes a merchant and reports update

### Debt checkpoints

- preserve original imported/user-entered text
- do not overwrite history destructively

## 12. Accounts

### Goal

Transactions should be attributable to real spending/income sources so account-level reporting becomes trustworthy.

### Current state

- `accounts` table exists
- UI only references accounts in settings copy

### Missing

- account CRUD
- transaction linkage in UI
- account-level reports

### Needed implementation

- settings management for accounts
- quick-add support for account selection/defaulting
- transaction editing support for account corrections
- report slices by account

### Tests

- integration: create and assign account
- e2e: save transaction with account and see it reflected in reporting

### Debt checkpoints

- unify account labels across settings, quick add, and reports

## Implementation order

This is the recommended order. Do not skip ahead unless a dependency is already completed.

1. Auth and household bootstrap reliability
2. Repository/error-model cleanup
3. Quick Add vertical slice to truly usable
4. Transactions review with edit capability
5. Settings: accounts and categories
6. Merchant normalization
7. Admin grid bulk workflows
8. Reports backed by explicit reporting services/views
9. Planning persistence
10. Attachments
11. Historical import and reconciliation tooling

## Definition of done

A feature is only done when all of the following are true:

- acceptance behavior is covered by tests
- errors are explicit and user-visible
- setup dependencies are documented
- no placeholder text remains implying functionality that does not exist
- domain logic is centralized and not duplicated across route/UI/server layers
- the feature works against real Supabase state, not just local mocks

## Immediate next slice

The next implementation slice should be:

1. finish Supabase auth user setup and household/bootstrap seed data
2. add a red/green/refactor Playwright test for successful login
3. complete a real Quick Add save flow against seeded reference data
4. clean up dashboard and transactions error states for unmapped/misconfigured users

This is the highest-leverage path because it validates the real system end-to-end before deeper feature work starts.

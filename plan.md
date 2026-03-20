## Recommended architecture

Build a private two-user household finance app with:

- Supabase as the backend
- Postgres as the database
- a simple mobile-friendly web frontend for daily entry
- an admin spreadsheet-style interface for corrections and bulk edits
- a reporting layer for trends, category breakdowns, and cashflow analysis

This creates a clean separation of concerns:

- the phone UI is optimized for speed and low friction
- the admin UI is optimized for power and correction
- the database is the source of truth
- the analytics views sit on top of raw data rather than being improvised inside a sheet

This is the right direction because AppSheet is currently doing four jobs at once: data entry, storage, editing, and analysis. That works for a while, then it becomes brittle.

## Core product decision

Treat this as a small, serious internal app, not as "just a spreadsheet."

The design principle is:

- the phone workflow should feel nearly as easy as AppSheet
- the database should be structured like a real finance system
- the admin workflow should feel spreadsheet-like without using Sheets as the backend
- analysis should come from curated reports and views, not from manually wrestling with raw rows

## Product goals

The product succeeds if it does three things well:

1. Captures transactions fast enough that both users actually use it every day.
2. Makes correction and cleanup easy without corrupting the source data.
3. Produces trustworthy reporting from structured data.

Adoption is the real constraint. A household finance system that is technically correct but annoying to use will decay into partial use, stale categorization, and bad analytics.

## Requirements mapped to concrete solutions

### Fast phone entry

Because expenses must be easy to add from the phone, the front door of the system should be a fast add form, not a dense data grid. The form should be stripped down to the fields that matter in the moment:

- date
- amount
- category
- account
- merchant
- note
- optional receipt photo

The flow should remember recent categories, suggest merchants, prefill sensible defaults, and allow one entry in seconds.

### Spreadsheet-style correction

Because you want "super user" spreadsheet-style editing, the app should have a separate admin transactions grid. It should support:

- sorting
- filtering
- inline editing
- bulk category reassignment
- search
- multi-row cleanup workflows

This is where mistakes get fixed. It should not be the primary data-entry interface for daily use.

### Structured analysis

Because you want reliable analysis, the schema must be structured properly from the beginning. If categories, merchants, accounts, and transaction types are all free text, reporting will decay quickly.

The system should support expenses, income, transfers, and adjustments distinctly. That is what enables:

- monthly cashflow
- category rollups
- merchant analysis
- trend views
- budget comparison later

### Security

Because this is shared financial data, use Supabase Auth and Row Level Security from the start. Every row should be associated with a household, and access should be limited to the two authorized users only.

You do not need clever infrastructure. You need disciplined configuration.

### Ease of use

The interface must not expose database thinking to the end user. Most complexity should be hidden behind defaults, autocomplete, presets, and correction workflows.

## Recommended data model

At minimum, include these core entities:

### `households`

A single shared household record for you and your wife.

### `users`

Authenticated users tied to that household.

### `accounts`

Checking, savings, credit cards, cash, and any other spending source.

### `categories`

Groceries, dining, mortgage, utilities, travel, kids, subscriptions, and so on.

### `merchants`

Normalized merchant names so analysis does not become polluted by spelling variations.

### `transactions`

The main table. Each record should include:

- date
- amount
- type
- account
- category
- merchant
- note
- created_by
- household_id
- status or review flag if needed

### `transaction_types`

At minimum:

- expense
- income
- transfer
- adjustment

### `budgets`

Optional at first, but useful later for category-level planning.

### `attachments`

Optional receipt photos or supporting files.

The most important design choice is that transfers should not be treated as expenses, and income should not be crammed into the same conceptual bucket as spending. If you fail here, cashflow reporting becomes muddy.

## UX plan

The app should have four main surfaces.

### 1. Quick Add

This is the screen your wife should live in. It should open fast on mobile and require almost no thought. Recent merchants and categories should appear immediately. If most entries are repetitive, the UI should exploit that aggressively.

Primary design constraints:

- mobile-first
- one-thumb friendly
- minimal typing
- minimal required fields
- obvious save state
- immediate confirmation after save
- easy "fix it after" path

### 2. Transactions

This is the review screen. You should be able to scroll, search, filter by date, category, account, merchant, amount, and uncategorized status, then edit records one by one.

### 3. Admin Grid

This is the spreadsheet-like power view. It should support inline editing, bulk changes, filters, and more advanced inspection. This is for cleanup and management, not casual entry.

### 4. Reports

This is where the system earns its keep. Prioritize:

- monthly spending by category
- income versus expense
- net cashflow over time
- spending by merchant
- account-level inflows and outflows
- recurring subscription review
- monthly and year-over-year trends

## Analytics best practices

Do not analyze raw transaction rows directly in the UI. Build a reporting layer in the database.

Create clean reporting views such as:

- monthly category spending
- monthly net cashflow
- income by month
- expenses by account
- top merchants
- uncategorized transactions
- recurring spend candidates

That keeps reporting logic stable and inspectable. Charts and dashboards should sit on top of those views rather than on raw transactional noise.

For a household finance app, the most useful analytics are usually not exotic:

- total spend by month
- category share by month
- income versus expense
- net cashflow
- trend lines for major categories
- uncategorized or suspicious entries
- subscriptions and recurring charges
- account inflows and outflows

That is enough to create discipline without turning the app into a personal ERP system.

## Security plan

Security should be deliberately boring.

Use Supabase Auth for the two users. Every record should belong to the household, and access policies should ensure that only authenticated users tied to that household can see or edit the data.

Do not:

- put admin keys in the frontend
- rely on hidden URLs
- use Google Sheets sharing logic as your security model

Also, do not store bank credentials or anything similarly dangerous. This is a ledger app, not a banking integration platform.

In practice, this setup should be more secure than a spreadsheet with ad hoc sharing and more reliable than a self-hosted setup that stops getting patched.

## Technical architecture

The current plan is directionally right. Its strongest qualities are:

- it prioritizes adoption over technical elegance
- it separates fast entry from power editing
- it treats reporting as a structured output of the database rather than a spreadsheet side effect

Its main gap was technical specificity. The next step is to lock in the baseline architecture so implementation choices do not drift.

### Recommended baseline stack

- frontend: SvelteKit web app optimized for mobile and desktop
- ui framework: Tailwind CSS plus shadcn-svelte primitives
- backend platform: Supabase
- primary database: Postgres
- auth: Supabase Auth
- authorization: Postgres Row Level Security
- file storage: Supabase Storage for receipts and attachments
- reporting layer: Postgres views and materialized views where needed
- admin editing model: dedicated admin grid UI backed by typed API/database operations
- deployment: hosted web app plus managed Supabase project

### Architecture review

The plan is strong on product logic and adoption risk. The main thing it needed was clearer decision space. The sections below frame the architecture as six major choices, with three viable directions for each.

### 1. Client platform direction

#### Direction A: Responsive web app first

Description:

Build one mobile-first web app that also contains the desktop admin experience.

Pros:

- one codebase keeps build and maintenance cost low
- changes ship immediately without app store review
- mobile entry and admin tooling can share auth, data access, and components

Cons:

- offline support is weaker unless explicitly engineered
- mobile hardware features are less ergonomic than in native apps
- perceived performance has less margin for sloppy frontend work

#### Direction B: Progressive web app with offline support

Description:

Build a web app first, but add installability, local caching, and queued sync behavior.

Pros:

- keeps the one-codebase advantage while improving mobile feel
- supports weak-connection entry better than a plain web app
- creates a future-friendly path for background sync and local draft recovery

Cons:

- offline correctness adds substantial complexity around sync and conflict handling
- browser support and install behavior are inconsistent across platforms
- debugging cached assets and stale local data is operationally annoying

#### Direction C: Native mobile app plus separate web admin

Description:

Build a dedicated mobile app for entry and a separate web interface for power editing and reports.

Pros:

- best possible mobile UX and hardware integration
- clearer separation between casual entry and admin operations
- better long-term path for notifications, camera, and advanced device features

Cons:

- highest cost in implementation and maintenance
- product iteration slows because every change crosses more surfaces
- disproportionate complexity for a two-user internal app

Recommended path:

Direction A.

Why it is recommended:

- the product needs to prove daily adoption before it optimizes for platform depth
- one codebase is the highest-leverage choice for a small shared household tool
- the main current risk is not missing native features, it is failing to ship a fast and usable entry flow

### 2. Frontend stack direction

#### Direction A: SvelteKit

Description:

Use SvelteKit for routes, forms, server endpoints, and the UI shell.

Pros:

- low boilerplate suits a small product with focused workflows
- form-heavy interactions are straightforward to build
- server and client code can stay close without needing multiple repos

Cons:

- fewer contributors will know it compared with React
- some advanced data-grid ecosystem choices are weaker
- code boundaries can blur if server and client responsibilities are not kept disciplined

#### Direction B: React with Next.js and MUI

Description:

Use a React ecosystem stack with Next.js for app routing/rendering and MUI for the core component system.

Pros:

- widest ecosystem for grids, tables, forms, and admin tooling
- easiest hiring and collaboration story if more developers join later
- many integration patterns are already well documented

Cons:

- more boilerplate and architectural surface area for a small internal app
- easy to overbuild with layers of abstractions that do not pay off here
- faster ecosystem churn can create maintenance drag

#### Direction C: Low-code or spreadsheet-adjacent frontend

Description:

Use a tool like AppSheet, Retool, or a very thin custom layer over hosted tables.

Pros:

- fastest route to a usable first interface
- admin-style data workflows come cheaply
- lowest initial engineering effort

Cons:

- the exact problem being solved is that one tool is trying to do too many jobs
- mobile entry UX usually feels acceptable rather than excellent
- long-term reporting and workflow customization tend to become brittle again

Recommended path:

Direction A.

Why it is recommended:

- SvelteKit keeps the codebase leaner, which fits a focused household product with a small team
- Tailwind and shadcn-svelte provide enough UI structure without forcing a larger React admin stack
- the main product risk is adoption and execution speed, and a lighter stack helps more than maximum ecosystem breadth

### 3. Backend platform direction

#### Direction A: Supabase as the integrated backend

Description:

Use Supabase for Postgres, auth, storage, and API access in one managed platform.

Pros:

- minimal infrastructure overhead for a serious but small app
- auth, storage, SQL, and policy management stay close together
- likely the fastest route to a production-ready internal system

Cons:

- backend design becomes somewhat coupled to platform conventions
- very custom workflows may push against platform boundaries
- platform migration later would require deliberate work

#### Direction B: Custom backend over managed Postgres

Description:

Use managed Postgres plus a custom API service such as Node, Go, or Python.

Pros:

- maximum control over business logic and API boundaries
- easier to enforce strict domain services and validation rules
- future integrations and background jobs can fit a more conventional service architecture

Cons:

- substantially more engineering work before the product feels complete
- auth, storage, and operational concerns must be assembled separately
- higher risk of spending time on platform work instead of entry UX

#### Direction C: Spreadsheet-first backend with sync layer

Description:

Keep Sheets or a similar tabular store as a major system component and sync into reports later.

Pros:

- lowest migration friction from the current setup
- very familiar correction workflow for spreadsheet users
- import and ad hoc editing stay easy at the beginning

Cons:

- weak guarantees for data integrity and security
- analysis quality decays as free-text drift accumulates
- this preserves too much of the current brittleness

Recommended path:

Direction A.

Why it is recommended:

- the project needs managed infrastructure, not more backend assembly work
- Supabase covers the exact primitives this app needs without pushing the team into platform engineering
- the custom-backend path only wins if domain complexity or integration demands become materially larger later

### 4. Data and reporting direction

#### Direction A: Operational tables plus reporting views

Description:

Use normalized transaction tables for writes and explicit SQL views for dashboards and analytics.

Pros:

- reporting logic becomes inspectable and stable
- write workflows stay separate from analytics concerns
- SQL views are a strong fit for household finance summaries

Cons:

- requires more up-front modeling than reading the base table directly
- view sprawl is a real risk if naming and ownership are weak
- report changes may touch both SQL and frontend layers

#### Direction B: Single transaction table with frontend aggregation

Description:

Keep the data model simple and compute most analytics in the application layer.

Pros:

- fewer SQL artifacts to maintain early on
- frontend developers can move quickly without waiting on database changes
- simple prototypes are easy to build

Cons:

- business logic gets duplicated across screens
- reporting becomes harder to trust and audit
- performance and consistency degrade as analytics become more complex

#### Direction C: Warehouse-style analytics path

Description:

Keep the transactional database lean and push reporting into a separate analytics store or pipeline later.

Pros:

- best long-term separation between app writes and heavy analytics
- allows richer historical modeling if scope expands significantly
- avoids overloading the operational database with future reporting ambitions

Cons:

- unnecessary complexity for the current size of the problem
- data pipelines introduce freshness and reconciliation issues
- slower path to useful reports in early phases

Recommended path:

Direction A.

Why it is recommended:

- the app needs trustworthy operational reporting immediately, not a future analytics platform
- SQL views give strong traceability from transaction rows to dashboard outputs
- frontend aggregation is too loose for finance data, while a warehouse path is premature

### 5. Security and access-control direction

#### Direction A: Supabase Auth plus Row Level Security

Description:

Use platform auth with `household_id`-scoped RLS on shared tables.

Pros:

- authorization is enforced at the data layer
- access rules stay consistent across app surfaces
- provides a clean path if the product ever expands beyond one household

Cons:

- policy mistakes can be subtle
- debugging blocked queries is slower than in an open schema
- SQL functions and admin operations need careful design

#### Direction B: App-layer authorization only

Description:

Keep database access broad and enforce permissions entirely in server code.

Pros:

- easier mental model for developers unfamiliar with RLS
- debugging is often more direct in one backend layer
- business rules can live alongside API handlers

Cons:

- one authorization bug in the app layer can expose all household data
- every access path must be implemented perfectly
- future scripts, admin tools, or direct queries are less safe by default

#### Direction C: Single-tenant trust model

Description:

Treat the app as a nearly single-tenant household app and keep access controls minimal.

Pros:

- fastest path to an initial prototype
- least policy complexity
- simplest developer ergonomics

Cons:

- weakest security posture
- painful to harden later if shortcuts spread through the system
- does not match the stated goal of a serious internal finance app

Recommended path:

Direction A.

Why it is recommended:

- financial data deserves enforcement at the data layer, even in a two-user app
- RLS reduces the blast radius of future mistakes in UI code, scripts, and admin tools
- the extra complexity is justified because security shortcuts are notoriously hard to unwind later

### 6. Transaction entry and workflow direction

#### Direction A: Split Quick Add and admin grid

Description:

Provide a minimal mobile entry flow and a separate power-editing surface.

Pros:

- each workflow can optimize for its actual job
- adoption improves because the main entry path stays simple
- cleanup and bulk correction can be powerful without cluttering mobile entry

Cons:

- two surfaces must be designed and maintained
- rules and validation must stay aligned across both paths
- some users may need guidance on when to use each screen

#### Direction B: Single universal transaction screen

Description:

Use one configurable transactions interface for entry, editing, and review.

Pros:

- one surface reduces implementation count
- behavior is more centralized
- users learn one main place to work

Cons:

- the interface usually becomes too dense for quick mobile entry
- tradeoffs tend to favor admin flexibility over ease of use
- the product risks recreating the AppSheet problem

#### Direction C: Fast capture with deferred enrichment

Description:

Design the system around fast save first, then cleanup queues, review flags, and suggestions afterward.

Pros:

- best fit for distracted mobile entry
- directly supports the adoption-first product goal
- creates a natural path for later automation and suggestions

Cons:

- incomplete data can accumulate if review discipline is weak
- reports need explicit handling for uncategorized records
- the system needs clear review workflows or the debt grows quietly

Recommended path:

Direction A plus Direction C together.

Why it is recommended:

- the product has two different jobs: capture quickly and clean up accurately
- a separate Quick Add surface is what keeps entry friction low
- deferred enrichment is the right operating rule because forcing completeness at entry time would directly harm adoption

### Recommended technical direction

The best current baseline remains:

- Direction A for client platform: responsive web app first
- Direction A for frontend stack: SvelteKit with Tailwind CSS and shadcn-svelte
- Direction A for backend platform: Supabase
- Direction A for data and reporting: operational tables plus reporting views
- Direction A for security: Supabase Auth plus Row Level Security
- Direction A plus Direction C together for workflow: split Quick Add and admin grid, with fast capture and deferred enrichment as a product rule

This combination is the strongest match for the plan because it keeps implementation scope practical while preserving a clean, lightweight codebase. It is the best fit for the two things that matter most: daily adoption and trustworthy reporting.

## Ease-of-use plan

This matters more than people admit.

The system will fail if entering an expense feels like doing taxes. Ease of use is not polish here; it is a core adoption requirement.

The app should have:

- strong defaults
- recent category shortcuts
- merchant autocomplete
- mobile-first layout
- minimal required fields
- low-latency save
- edit-after-save support
- graceful handling of mistakes

The default daily-entry rule should be: capture first, perfect later.

That means:

- it is acceptable to save with partial metadata
- uncategorized or loosely categorized entries should be easy to review later
- the app should optimize for speed at entry time and precision during cleanup

### Entry design principles

- Require only what is necessary to save a valid transaction.
- Default the date to today, the account to the most likely recent account, and the category to the most likely recent category when confidence is high.
- Keep typing optional wherever possible.
- Make save feedback immediate and unambiguous.
- Let users correct mistakes without penalty.
- Make "add another" faster than returning to a home screen.

### Strong first-pass defaults

For common household spending, the app should learn from recent behavior:

- recent categories by user
- recent merchants by user
- likely account by merchant
- likely category by merchant
- recently used amounts for recurring bills

These should remain assistive, not mandatory. Wrong predictions are worse than no predictions if they are hard to override.

### Error-tolerant workflows

People will mistype amounts, pick the wrong category, save duplicates, and forget details. The system should assume this and recover well:

- make edit-after-save one tap away
- allow uncategorized saves
- support duplicate detection heuristics later
- preserve raw notes even when merchant normalization changes
- keep audit metadata for who created and edited a transaction

### Performance expectations

Quick Add should feel instant. If save latency is visibly slow, users will hesitate, double tap, or defer entry.

Target behavior:

- fast initial load on mobile
- save confirmation within roughly one interaction beat
- optimistic or near-optimistic UI where safe
- stable behavior on weak mobile connections

### Later-stage intelligence

Predictive entries are promising, but they should be staged after the base workflow is solid.

Later-stage options:

- location-aware suggestions based on GPS
- receipt scanning and OCR
- predictive category suggestions
- recurring expense prompts
- merchant normalization recommendations

These are useful only after the baseline entry flow is already fast, trusted, and low-friction.

## Delivery plan

Build this in phases.

### Phase 1: Foundation

Set up Supabase, define the schema, establish authentication, create the core tables, and enforce Row Level Security correctly. Then import the existing AppSheet and Google Sheet data into the new schema.

Exit criteria:

- authenticated access works for both users
- the schema supports all core transaction types
- imported data is queryable and auditable
- household data isolation is enforced

### Phase 2: Daily usability

Build the mobile-first Quick Add flow and the basic transactions list. This is the most important phase because it determines adoption.

Exit criteria:

- a transaction can be entered from a phone in seconds
- recent categories and merchants are usable
- edit-after-save works cleanly
- uncategorized entries can be reviewed later

### Phase 3: Super-user operations

Add the spreadsheet-style admin grid for correction, filtering, bulk updates, and search.

Exit criteria:

- bulk editing is practical
- filtering and search are fast enough for real cleanup work
- category and merchant normalization can be corrected centrally

### Phase 4: Reporting

Create reporting views in Postgres and build a clean dashboard for category spending, income, expenses, and cashflow.

Exit criteria:

- monthly cashflow is trustworthy
- category reporting is stable
- uncategorized and suspicious transactions are visible

### Phase 5: Refinement

Add recurring transaction suggestions, receipt attachment support, better merchant normalization, and budget comparisons if useful.

Exit criteria:

- the system saves time rather than adding maintenance
- suggestions improve speed without reducing trust
- advanced features remain optional

## Persona review

Review the plan from six different user perspectives to pressure-test adoption and product scope.

### 1. Primary daily user

"I want to log a purchase in under ten seconds and move on."

What this persona validates:

- Quick Add must dominate the product design
- typing must be minimized
- defaults and recents matter more than elegant architecture

What would fail them:

- too many required fields
- laggy saves
- category trees that require hunting

### 2. Household co-owner

"I need the system to feel shared, not like someone else's admin tool."

What this persona validates:

- both users need low-friction entry
- shared categories and merchant history should help both users
- permissions should be simple and invisible, not something they manage

What would fail them:

- one user has a good workflow and the other does not
- the app feels tuned only for the more technical partner

### 3. Super user / data cleaner

"I am willing to spend time fixing and organizing data, but I need leverage."

What this persona validates:

- the admin grid is necessary
- bulk correction workflows save real time
- normalized merchants and categories matter for long-term reporting quality

What would fail them:

- every cleanup requires one-row-at-a-time editing
- there is no way to safely normalize messy historical data

### 4. Analyst / planner

"I care less about the entry flow and more about whether the reports are trustworthy."

What this persona validates:

- structured transaction types are mandatory
- reporting views should be explicit
- uncategorized and suspicious data must be visible

What would fail them:

- transfers counted as expenses
- inconsistent merchant naming
- charts built directly on messy raw data

### 5. Mobile-first tired parent

"I am entering transactions while distracted. The app must tolerate partial attention."

What this persona validates:

- one-handed operation matters
- interruption recovery matters
- edit-after-save is critical
- partial entry is better than abandoned entry

What would fail them:

- timeouts, lost form state, or brittle validation
- dense layouts that require focus and precision

### 6. Skeptic

"This sounds like a lot of work to replace a spreadsheet. Why won't this become overbuilt?"

What this persona validates:

- the phased plan must deliver value early
- Phase 2 must be genuinely usable before advanced features begin
- predictive features should be deferred until the core flow works

What would fail them:

- spending weeks on clever automation before basic entry is excellent
- building a complex finance system with low actual household adoption
- no measurable success criteria for speed, accuracy, and reporting usefulness

The skeptic is useful because they force product discipline. If a feature does not clearly improve speed, trust, or reporting quality, it should probably wait.

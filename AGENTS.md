# AGENTS.md — Dragon Store

Guidance for AI coding agents working in this repository. Read this before editing.
It is intentionally concise; the authoritative deep rulebook is
`.specify/memory/constitution.md`. This file summarizes and operationalizes it,
and adds rules that supersede outdated documentation.

## 1. Project Overview

**Dragon** is a private, single-tenant e-commerce store for vape/tobacco products,
protected by a site-wide shared password (no user accounts — session-based auth only).
It is being adapted to run as an **in-store kiosk on a tablet**: browse → pick a
variant/flavor → add to cart → confirm the order directly from the cart → reveal an
order number → track later by that number. **There is no online payment and no
customer checkout form.**

- **Stack:** Next.js 15 (App Router) · TypeScript strict · Payload CMS v3 · Neon
  PostgreSQL · Tailwind + shadcn/ui · Framer Motion · Zustand (UI-only) · Zod ·
  Vitest + Playwright.
- **Two surfaces:**
  - **Payload Admin** (`/admin`) — staff manage brands, categories, products,
    variants (incl. optional **internal** price), stock, images, and orders.
  - **Storefront/kiosk** (`(storefront)` routes) — customer-facing; **must never
    display or receive price data**.

## 2. Source of Truth (precedence)

When guidance conflicts, follow this order (highest first):

1. The agent's own system/safety instructions (never overridden).
2. The human's explicit request in the current conversation.
3. A nested `AGENTS.md` closer to the file being edited (if any exist — none do today).
4. **This root `AGENTS.md`.**
5. `.specify/memory/constitution.md` (the constitution).
6. Active feature/module plans (currently `plans/PLAN.md` for the kiosk/pricing work).
7. Existing code.
8. `README.md` and other docs.

**Outdated docs to distrust:** the constitution and `specs/002-cart-checkout`
still describe **Cash-on-Delivery, a customer checkout form, phone-based order
tracking, `price_at_add`, and customer-facing prices**. The active plan
`plans/PLAN.md` supersedes these: prices
are internal-only, there is no checkout form, tracking is order-number-only. When
code and docs disagree, trust the code and the active plan, and flag the conflict.

## 3. Architecture Boundaries

Feature-Sliced layers. **Dependencies flow strictly downward** — a layer imports
only from layers below it. Across layers, import via the target layer's public
`index.ts` using `@/`; inside one feature/module, use relative private imports.

| Layer | May import from | MUST NOT import |
|-------|-----------------|-----------------|
| `src/app/` (routes, composition) | `widgets/`, `features/`, `shared/`; narrowly `core/auth/session` for mandatory DAL verification; infrastructure routes may use `@/lib/payload` | direct `modules/` or `payload/` business imports |
| `src/widgets/` (cross-feature UI) | `features/`, `shared/` | `app/`, other `widgets/`, `modules/`, `core/` |
| `src/features/` (self-contained units) | `modules/`, `core/`, `shared/`, `@/lib/payload` | **other features**, `app/`, `widgets/`, `payload/` |
| `src/modules/` (pure business logic, no UI) | `core/`, `shared/lib`, `shared/types`, `@/lib/payload` | `features/`, `app/`, `widgets/`, `payload/`, other `modules/` |
| `src/core/` (infra: auth, env, logger, errors, rate-limit) | `shared/types`, `shared/config` | everything else |
| `src/payload/` (collections, hooks, access, admin) | hooks→`modules/core/shared`; collections→`shared/types`; `payload.config.ts` may register feature-owned schemas | feature UI/actions, app, or widgets from collections/hooks |
| `src/shared/` (dumb UI + generic utils) | external libs only | any internal layer |

- **Features are strictly isolated** — never import one feature from another.
  Compose features only in `app/` pages or `widgets/`.
- Feature-owned Payload collections live in `features/<name>/db/schema.ts` and are
  registered in `src/payload/payload.config.ts`.
- The public-API rule applies across layers and to external consumers. Inside one
  feature/module, use relative imports for private files; do not route internal
  implementation imports through the feature's barrel.
- Every feature must have `index.ts`, `README.md`, `feature.config.ts`, and be
  listed in `src/features/_registry/index.ts`.

## 4. Next.js Rules

- **Server Components by default.** Add `'use client'` only for state/effects/
  browser APIs; keep client components small.
- **Security is in the Data Access Layer, not middleware** (CVE-2025-29927).
  Call `verifySession()` from `@/core/auth/session` at the start of every Server
  Component, Server Action, and API route that touches data. Middleware is for UX
  redirects only.
- **Server Actions** must: validate input with Zod, use try/catch and return
  `ActionResult<T>` (`{ success, data?, error?, code? }`) — never throw, delegate
  business logic to `modules/`, and log errors via `@/core/logger`.
- Redirects use `next/navigation` `redirect()`. Use `notFound()` for missing data.
- Metadata lives in route `metadata`/`generateMetadata` — **never put prices in it.**
- Data fetching goes through `@/lib/payload` `getPayloadClient()`; invalidate with
  `revalidatePath`/`revalidateTag` **outside** DB transactions (never inside).

## 5. Payload CMS Rules

- Access all data through `getPayloadClient()` (Local API). Use
  `overrideAccess: false` when a user/session context should be enforced;
  `overrideAccess: true` only for deliberate system-level storefront reads.
- **Thread `req` (with `transactionID`) through every operation inside a
  transaction.** Pass `depth: 0` and `context: { skipRevalidation: true }` for
  writes inside transactions.
- **Field layout in the admin form uses layout fields** (`collapsible`, `tabs`,
  `row`, `group`). A collection's `admin.group` only groups **collections** in the
  nav sidebar — it does **not** group fields. Put the optional variant price in a
  `collapsible` "Internal Pricing" section.
- Generated Payload types are **not currently committed or imported** — code uses
  explicit casts. If you introduce generated types, run `npx payload generate:types`
  and wire them consistently; do not assume a `payload-types.ts` exists.
- **Database safety — critical:** the live Neon DB is the only complete source of
  catalog, media, users, and site settings. Seed files are **not** a backup
  (`migration-data.json` has no media/users/settings; `seedsql.txt` is an old
  incompatible schema; the last migration failed). See §6.

## 6. Data, Transactions & Database Safety

- **Inventory and orders are transactional.** Stock decrement, order creation,
  order-items creation, and cart clearing happen inside one Payload transaction
  with rollback on any error. Create `order_items` **sequentially** (Drizzle binds a
  transaction to one connection — parallel writes deadlock). Do not clear the cart
  with a fire-and-forget call after commit — clear it **inside** the transaction.
- **Idempotency:** protect order creation against duplicate/concurrent submits with
  a unique idempotency key **plus** an atomic cart claim, not just a disabled button.
- **Kiosk cart identity:** the current model is one persistent cart row per
  authenticated device session, not a hardware-global cart. Reuse that row across
  orders and recover/reset it after inactivity; a new authentication session may
  intentionally create a new cart. Never create a second cart for the same
  `session_id` when an expired row already exists. A null `processing_key` means
  available; claim with the order idempotency key and `processing_started_at`.
  Never reset a recent claim; only recover a claim older than the two-minute stale
  threshold. After a successful order, empty and release the same row in the
  transaction so the next customer receives an empty cart on the same tablet.
- **Prices are server-authoritative and internal-only.** Never trust price or stock
  values supplied by the browser. Re-fetch authoritative variant data server-side
  during order creation. Never serialize `price` into any Client Component's props.
- **Nullable prices:** represent a missing price as `number | null`. Keep the
  distinction: `null`/`undefined` = **no price**; `0` = **explicit free**. Never use
  `price || 0` or `variant.price ?? 0` as a business value; use `price ?? null`.
  The new flow stores only nullable `order_items.unit_price`; legacy aggregate price
  columns remain optional/hidden and are not written or read.
- **Never run `DROP SCHEMA` or a full DB reset.** Destructive schema changes are
  allowed only on order/cart tables, as **targeted** `ALTER TABLE ... DROP COLUMN`,
  and only after: confirming the environment, checking record counts, verifying seed
  coverage, taking a backup (prefer a Neon branch), and getting explicit approval.
  Catalog, media, users, and site-settings tables are off-limits to destructive ops.

## 7. Features & Modules

- **Feature** = a self-contained business unit **with UI** (e.g. `cart`, `products`,
  `checkout`, `order-tracking`, `gate`). Template: `.ai/feature-template.md`.
  Layout: `ui/` (+ private `ui/_components/`), `actions/`, `logic/`, `db/`, plus
  `index.ts`, `types.ts`, `constants.ts`, `README.md`, `feature.config.ts`, `tests/`.
- **Module** = **pure business logic, no UI/React/JSX**, shared by 2+ features
  (e.g. `modules/catalog`, `modules/orders`). Template: `.ai/module-template.md`.
- **Decision:** UI needed → feature. Pure logic used by ≥2 features → module.
- Export public API through `index.ts` only. Never export `_components`. Register new
  features in `features/_registry/index.ts` and add `README.md` + `feature.config.ts`.
- Add focused tests for changed critical business behavior. A broad new regression or
  visual test suite is intentionally outside this fast single-tablet release.

## 8. TypeScript & Validation

- Strict mode. Explicit return types on public functions. `interface` for object
  shapes, `type` for unions/intersections. **No `any`** — use `unknown` + narrowing.
- Minimize casts; prefer real types. Existing `as`-heavy code is legacy — do not
  expand the pattern.
- Validate every external input and Server Action payload with **Zod** at the boundary.
- **No `|| 0` fallback for optional prices; no `.toFixed()` on nullable values; no
  `Math.min/max` over possibly-empty or null-containing price arrays.**

## 9. UI Rules

- **Tailwind only** — no inline `style={{}}`, CSS modules, or styled-components. Use
  the `cn()` helper (`@/shared/lib`). Reuse `shared/ui` primitives; build cross-feature
  UI in `widgets/`.
- Mobile/tablet-first and accessible (semantic elements, labels, focus states) — this
  runs on an in-store tablet.
- **Customer-facing privacy:** the storefront shows product image, name, brand,
  variant name/image, availability, quantity controls, variant count, and add-to-cart.
  It must **never** show or receive price, subtotal, total, currency, customer name,
  phone, or payment text. Keep prices in server/admin code only.

## 10. Testing & Completion Gates

Target package manager: **pnpm**. Phase 0 of `plans/PLAN.md` is complete: the
repository has a verified `pnpm-lock.yaml` and a pinned `packageManager` entry.

Validation commands:

```bash
pnpm install --frozen-lockfile
pnpm typecheck      # tsc --noEmit
pnpm lint           # next lint (deprecated on Next 15)
pnpm test           # focused Vitest files while iterating; full existing suite at handoff
pnpm build          # needs DATABASE_URL, PAYLOAD_SECRET
pnpm test:e2e       # only when the existing Playwright setup is available
```

- **Minimum for this release:** `typecheck`, `lint`, focused critical tests, and a
  build against validated non-production environment variables. Perform one manual
  tablet happy-path smoke; do not build a new exhaustive E2E harness solely for it.
- If a command cannot be run (missing env, missing config), **say so explicitly**
  with the reason — never claim success without evidence.

## 11. Safe Change Workflow

1. Read related files and trace imports/data flow before editing.
2. Identify breaking schema changes and the collections/types they touch.
3. Make schema changes **additive/relaxing first**; drop columns only after all code
   references are gone (and behind the §6 DB-safety gate).
4. Update or add tests alongside the change.
5. Run the relevant validation gates (§10).
6. Summarize exactly which files changed and why.
7. Do not commit or push unless explicitly asked.

## 12. Prohibited Behaviors

- Do **not** drop the database schema or reset the DB without the §6 gate + approval.
- Do **not** remove catalog/media/user/settings data while cleaning up order/cart tables.
- Do **not** expose secrets or read `process.env` directly (use `@/core/config/env`).
- Do **not** trust client-supplied prices or stock; do **not** send internal price to
  Client Components.
- Do **not** silently convert a missing price to `0`.
- Do **not** bypass transactions for stock/order writes, or parallelize order-item
  inserts inside a transaction.
- Do **not** add a product-level price field.
- Do **not** import across features, put business logic in pages, or add unnecessary
  Client Components.
- Do **not** create duplicate architecture layers or export private `_components`.
- Do **not** edit generated or temporary files (`migration-data.json`, `seedsql.txt`,
  `*.tsbuildinfo`) unless the task requires it.
- Zustand remains UI/control state only. A short-lived idempotency key may be
  session-persisted for retry recovery, but cart items, prices, totals, and stock
  must never be stored there.

---

### Nested AGENTS.md files

None are used today, and none are created here. This is a **single Next.js app, not a
monorepo**, and the constitution already provides deep per-layer rules; nested files
would mostly duplicate it and risk drift. **Recommendation:** revisit only if the repo
splits into packages, or if DB/schema mistakes recur — in which case a focused
`src/payload/AGENTS.md` (Payload + DB-safety) is the highest-value candidate. Add such
a file only when it carries rules not already covered here or in the constitution.

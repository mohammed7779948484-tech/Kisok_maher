# kisok Storefront Design-System Redesign Plan

> Updated: 2026-07-21
> Scope: customer-facing UI only
> Policy: strict logic freeze; no schema, API, action, query, mutation, auth, cart, stock, order, validation, cache, or route behavior changes.

## 1. Audit and baseline

### Architecture inspected

- Next.js 15 App Router with distinct `app/(storefront)` and `app/gate` layouts.
- Feature-Sliced UI across `widgets`, `features`, and `shared/ui`.
- Tailwind CSS 3.4, shadcn new-york conventions, Radix primitives, CVA, Lucide, and Framer Motion.
- Inter is loaded separately by the gate and storefront layouts; no theme provider or switcher exists.
- Customer data is server-fetched and passed into small client components for selection, cart mutations, order confirmation, and tracking.

### Styling and branding findings

- `src/app/globals.css` is the active theme source, but contains an obsolete dark HSL palette.
- `src/core/config/theme.config.ts` is unused and duplicates a different obsolete dark palette.
- Tailwind maps only basic shadcn colors, radii, and font family; typography roles, semantic surface/status colors, spacing, elevation, sizing, motion, and the requested responsive policy are absent.
- The storefront forces `dark`; the gate does not, creating inconsistent rendering.
- The visible `kisok` name is centralized for header, mobile navigation, footer, gate, hero, and metadata.
- The raster logo is large and contains extra “Gift & more” artwork, so a temporary current-color vector `D` mark will be used until final brand artwork is approved.
- Major duplicated patterns: page headers, empty states, logo blocks, manual buttons, quantity steppers, card shells, and status styling.
- Hard-coded design values include arbitrary shadows/blurs, data-URI decoration, default Tailwind breakpoints, many one-off type sizes, undersized heights, and component-local status colors.

### Customer UI inventory

- Foundation: globals, Tailwind config, providers, font/layout configuration, shared motion and UI primitives.
- Branding/navigation: Header, MobileNav, Footer, Hero, WhatsApp control.
- Catalog: home, brands, categories, products, filters, cards, grids, detail gallery, variant selector.
- Cart/order: cart button, drawer, page, cart rows, summary, empty state, order confirmation/reveal.
- Tracking/gate: gate screen/form/error, tracking form/result/timeline.
- Missing shared patterns: canonical Logo/Icon, Card, StatusBadge, EmptyState, Skeleton, PageHeader, and centralized quantity-control styling.
- Missing route states: no dedicated customer loading/error/not-found files currently exist.

### Logic-heavy, high-risk files

Only render structure, semantic attributes, and tokenized classes may change in:

- `src/features/gate/ui/GateForm.tsx`
- `src/features/products/ui/VariantSelector.tsx`
- `src/features/products/ui/_components/ProductInteractive.tsx`
- `src/features/cart/ui/AddToCartButton.tsx`
- `src/features/cart/ui/CartDrawer.tsx`
- `src/features/cart/ui/_components/CartItem.tsx`
- `src/features/cart/ui/_components/CartSummary.tsx`
- `src/features/checkout/ui/OrderConfirmation.tsx`
- `src/features/order-tracking/ui/TrackOrderForm.tsx`

Handlers, hooks, dependency arrays, action calls, payloads, validation, idempotency, routing, and state transitions remain unchanged.

### Baseline evidence

- `pnpm typecheck`: passed.
- `pnpm lint`: passed with four pre-existing `no-img-element` warnings.
- `pnpm test`: 8 files / 35 tests passed with the pre-existing local `vitest.config.ts` exclusion.
- `pnpm build`: passed; same four image warnings plus upstream Node/Postgres deprecation notices.
- `pnpm test:e2e`: baseline failure before redesign because Playwright scans Vitest files and `@playwright/test` is not installed.
- Local health endpoint: HTTP 200 with database connected.
- Browser DOM/console inspection: gate rendered with no console warnings/errors. Screenshot capture returned black frames despite a complete DOM, so it is not accepted as visual evidence.
- Existing `.playwright-mcp` artifacts document prior storefront/cart/confirmation flows but remain pre-existing, untracked work and will not be edited.

## 2. Design-system architecture

### Central token source

Create `src/shared/config/design-system.ts` as the one build-time registry for:

- exact canonical RGB color channels and semantic aliases;
- typography roles;
- spacing scale;
- radii;
- restrained elevations;
- sizing and touch targets;
- compact/medium/expanded breakpoints;
- motion durations.

`tailwind.config.ts` will import this registry, expose stable semantic utilities, and generate the CSS custom properties on `:root`. `globals.css` will retain only base rules, reusable component recipes, and reduced-motion behavior. RGB channels preserve Tailwind opacity modifiers without duplicating hex values.

Compatibility aliases (`background`, `foreground`, `card`, `muted`, `accent`, `border`, `input`, `ring`) will map onto the new semantic system during migration. No dark palette will be added.

### Branding source

- Create `src/shared/config/brand.config.ts` with `name`, `shortName`, `displayName`, and `description`.
- Create one full `BrandLogo` and one compact `BrandIcon` in shared UI.
- Use one clean current-color vector `K` mark for the kisok identity.
- Use the central branding source for customer metadata and visible brand text where server/client boundaries permit.

### Shared components

- Upgrade Button, Input, Checkbox, Badge, Sheet, Breadcrumb, and motion defaults.
- Add shared Card, StatusBadge, EmptyState, Skeleton, and PageHeader patterns only where used.
- Keep component behavior stable; variants own visual semantics rather than feature-local palette classes.
- Use `MotionConfig reducedMotion="user"` plus CSS `prefers-reduced-motion` fallbacks.

## 3. Migration strategy

### Stage A — foundation and primitives

1. Install no new design dependency.
2. Add central tokens, semantic Tailwind aliases, branding, vector mark, typography roles, responsive policy, and reduced-motion support.
3. Migrate shared primitives to 48px touch targets, 52px fields, 12px button/input radii, consistent focus rings, status variants, and restrained elevation.
4. Remove the obsolete unused theme config after confirming no imports.

### Stage B — branding, navigation, and catalog

1. Remove forced dark mode and the zoom prohibition while preserving session verification.
2. Consolidate header, mobile navigation, footer, gate, hero, and metadata branding.
3. Restyle home, section headers, product/brand/category grids, cards, filters, product details, and flavor selection.
4. Use 4:3 product imagery, 1:1 flavor imagery, wrapping names, semantic availability states, visible focus, and declared selected states.

### Stage C — cart, confirmation, tracking, and states

1. Restyle the cart drawer/page/items/summary and quantity controls without touching mutation logic.
2. Improve confirmation hierarchy, order-number readability, and next-customer action without changing reveal/reset behavior.
3. Standardize tracking form, errors, status timeline, operational numerals, loading feedback, and empty states.
4. Add customer loading/error presentation only where it can be done without changing business error semantics.

### Stage D — cleanup and verification

1. Search customer files for hard-coded colors, arbitrary radii/shadows/type/durations, old breakpoints, duplicated logo SVG, and repeated brand strings.
2. Review the full diff specifically for action calls, handlers, payloads, hooks, routes, auth, price fields, cart/order state, and error semantics.
3. Run typecheck, lint, unit tests, production build, available E2E, and browser checks at all requested viewports.
4. Ask an independent regression/accessibility subagent to review the final diff.

## 4. Responsive and accessibility policy

- Compact `<720px`: one-column content, mobile sheet navigation, full-width primary actions, no horizontal overflow.
- Medium `720–1099px`: tablet-first density, usable multi-column grids, wider cart drawer, 48px controls.
- Expanded `>=1100px`: bounded 1440px content, wider catalog grids, stable product/cart columns.
- Remove `maximumScale: 1`; verify usability at browser zoom 200%.
- Minimum interactive target 48×48, field minimum 52px, prominent CTA 56px.
- Preserve semantic links/buttons, add strong `focus-visible`, explicit selected state, labels for icon controls, non-color status text/icons, tabular operational numerals, and long-name wrapping.
- Respect reduced motion and remove decorative endless animation.

## 5. Files expected to change

- Foundation/config: `tailwind.config.ts`, `src/app/globals.css`, `src/app/providers.tsx`, new shared config and shared UI files.
- Layout/routes: gate and storefront layouts; customer listing/detail/cart/tracking/confirmation pages.
- Widgets: header, mobile nav, footer, hero, product grid, tracking section, WhatsApp control.
- Feature UI only: products, cart, checkout confirmation, gate, and order tracking UI files listed in the inventory.
- Documentation: this plan and a concise shared design-system README update.

Files that must not receive logic changes include all actions, queries, mutations, schemas, modules, Payload collections, middleware, auth/session code, and database/migration files.

Pre-existing work to preserve: `vitest.config.ts`, `tsconfig.tsbuildinfo`, `.playwright-mcp/`, and any unrelated changes discovered later.

## 6. Risks and rollback

- Tailwind alpha support requires RGB channel tokens; direct hex mappings would break existing `/opacity` modifiers.
- The shared globals also coexist with Payload routes, so admin smoke testing is required even though admin design is out of scope.
- Breakpoint migration can create silent overflow; use named new screens and verify each requested viewport.
- Logic-heavy client components are prone to accidental behavioral changes; compare their non-class diff and preserve handlers exactly.
- The raster logo is not approved canonical artwork; the vector `D` is explicitly temporary.
- Rollback is file-scoped: foundation, shared primitives, then each journey area can be reverted independently because no data/schema/API change is permitted.

## 7. Acceptance criteria

- Exact required light palette, type, spacing, radii, elevation, sizing, breakpoints, and motion are centrally controlled.
- kisok branding and canonical full/compact logo components are used across customer surfaces.
- No internal price data is rendered or newly serialized.
- Product discovery, flavor selection, quantity changes, cart mutations, direct order confirmation, reveal, reset, tracking, and gate behavior remain unchanged.
- Customer components use semantic tokens rather than hard-coded semantic colors.
- Touch targets, focus visibility, long text, selected/disabled/loading/error states, 200% zoom, reduced motion, and requested viewports are verified.
- Typecheck, lint, unit tests, and production build pass; any E2E infrastructure failure is reported accurately.
- Final diff contains no unintended business-logic change and receives an independent regression/accessibility review.

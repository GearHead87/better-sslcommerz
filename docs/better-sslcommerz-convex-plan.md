# @better-sslcommerz/sdk Convex Component Plan

## What I analyzed

I analyzed three areas in detail:

1. Convex reference components:
   - `demo-project/stripe` (from `git@github.com:get-convex/stripe.git`, commit `cc548e4`, branch `master`)
   - `demo-project/polar` (from `git@github.com:get-convex/polar.git`, commit `61797c1`, branch `main`)
2. Your current SDK package:
   - `packages/better-sslcommerz`
3. Your validator package:
   - `packages/validators`

I also added `demo-project/` to root `.gitignore` so the cloned repos stay local and are not accidentally committed.

---

## Git SSH clone setup (reference)

Your local clones already exist and are correctly configured with SSH remotes:

- `demo-project/stripe` -> `git@github.com:get-convex/stripe.git`
- `demo-project/polar` -> `git@github.com:get-convex/polar.git`

If you need to recreate on another machine, use:

```bash
git clone git@github.com:get-convex/stripe.git demo-project/stripe
git clone git@github.com:get-convex/polar.git demo-project/polar
```

---

## Deep analysis: `@convex-dev/stripe`

### Package and build shape

Key files:

- `demo-project/stripe/package.json`
- `demo-project/stripe/tsconfig.json`
- `demo-project/stripe/tsconfig.build.json`
- `demo-project/stripe/convex.json`

Important patterns:

- `type: "module"`
- `files: ["dist", "src"]` so source and dist are shipped.
- Explicit `exports` for:
  - `.` -> client API (`dist/client/index.js`)
  - `./react` -> React helpers
  - `./_generated/component.js` -> ComponentApi typings
  - `./convex.config.js` -> app installation entry
  - `./test` -> test helper entry (note: current repo seems to reference `src/test.ts`, but this file is missing in this checked-out commit)
- Build uses plain TypeScript compiler (`tsc --project tsconfig.build.json`) instead of bundling.
- Codegen step is explicit: `npx convex codegen --component-dir ./src/component`.

### Convex component internals

Key files:

- `demo-project/stripe/src/component/convex.config.ts`
- `demo-project/stripe/src/component/schema.ts`
- `demo-project/stripe/src/component/public.ts`
- `demo-project/stripe/src/component/private.ts`

Architecture:

- Component name declared by `defineComponent("stripe")`.
- Strong table/index modeling in `schema.ts` for webhook-driven querying:
  - `customers`
  - `subscriptions`
  - `checkout_sessions`
  - `payments`
  - `invoices`
- Public/internal split:
  - `public.ts` has query/mutation API expected by app code.
  - `private.ts` contains webhook sync and low-level write operations.

Design quality worth copying:

- Uses schema validators directly for return shapes (`schema.tables.*.validator`).
- Returns docs without `_id` and `_creationTime` in public API.
- Adds indexes specifically for product use-cases (`by_user_id`, `by_org_id`, etc.).
- Handles webhook race conditions and out-of-order events in DB logic.

### Runtime client API pattern

Key files:

- `demo-project/stripe/src/client/index.ts`
- `demo-project/stripe/src/client/types.ts`

Pattern:

- Exposes class `StripeSubscriptions(component, options)`.
- Class handles provider SDK interaction (Stripe API calls).
- Writes synchronized state into component tables via `ctx.runMutation(component.private.*)`.
- Keeps secrets in app/runtime side (`process.env.STRIPE_SECRET_KEY`), not in component state.
- Exposes route installer function: `registerRoutes(http, component, config)`.

This is the critical architecture to mirror for SSLCommerz:

- HTTP/API network calls happen in client/app code where env vars are available.
- Component stores normalized payment state and offers typed query/mutation API.

### App integration pattern

Key files:

- `demo-project/stripe/example/convex/convex.config.ts`
- `demo-project/stripe/example/convex/http.ts`
- `demo-project/stripe/example/convex/stripe.ts`

Pattern:

- App installs component through `app.use(stripe)`.
- App mounts webhook route via package helper (`registerRoutes`).
- App owns auth logic; component never calls `ctx.auth`.
- App uses `components.stripe.public.*` for querying component data.

### Test strategy

Key files:

- `demo-project/stripe/src/component/setup.test.ts`
- `demo-project/stripe/src/component/public.test.ts`
- `demo-project/stripe/src/client/setup.test.ts`
- `demo-project/stripe/src/client/index.test.ts`

Pattern:

- Uses `convex-test` for component logic.
- Separate tests for component behavior and client behavior.
- Good coverage around webhook race conditions and metadata linkages.

---

## Deep analysis: `@convex-dev/polar`

### Package and export shape

Key files:

- `demo-project/polar/package.json`
- `demo-project/polar/tsconfig.json`
- `demo-project/polar/tsconfig.build.json`
- `demo-project/polar/convex.json`

Important differences from Stripe:

- Exports both `./convex.config` and `./convex.config.js` for compatibility.
- Exports `./test` and actually provides `src/test.ts` (helper for consumers).
- Has a richer React surface (`src/react/index.tsx`) with real UI helpers.

### Component internals

Key files:

- `demo-project/polar/src/component/convex.config.ts`
- `demo-project/polar/src/component/schema.ts`
- `demo-project/polar/src/component/lib.ts`
- `demo-project/polar/src/component/util.ts`

Pattern:

- Uses one `lib.ts` file with broad query/mutation/action API.
- Stores provider payloads in normalized Convex tables:
  - `customers`
  - `products`
  - `subscriptions`
- Includes stale-update guards (`modifiedAt` compare) to prevent old webhook overwrites.
- Conversion helpers in `util.ts` keep provider SDK shapes out of DB layer.

This conversion-layer pattern is excellent for SSLCommerz as well.

### Runtime class + route registration

Key file:

- `demo-project/polar/src/client/index.ts`

Pattern:

- `Polar` class wraps provider SDK and component APIs.
- `api()` method generates ready-to-export Convex actions/queries.
- `registerRoutes(http, { events... })` supports typed custom handlers.
- Built-in persistence always runs; user handlers are add-ons.

This API style can inspire your `Sslcommerz` class:

- `sslcommerz.api()` for app-facing functions.
- `sslcommerz.registerRoutes(http, ...)` for IPN route registration.

### Consumer testing support

Key files:

- `demo-project/polar/src/test.ts`
- `demo-project/polar/example/convex/setup.test.ts`

Pattern:

- Exposes a package-level test helper (`register`) so app test suites can register the component quickly.
- This is useful and should be included in your component package.

---

## Common patterns extracted from Stripe + Polar

Both component packages consistently do the following:

1. Keep a strict packaged component boundary:
   - component internals under `src/component/*`
   - runtime client wrappers under `src/client/*`
   - optional UI helpers under `src/react/*`
2. Export install + typing entry points:
   - `./convex.config(.js)`
   - `./_generated/component.js`
3. Keep secrets/env outside component DB functions.
4. Keep auth logic in the app wrapper.
5. Offer webhook route registration helper.
6. Include an `example/` app that proves install + usage.
7. Use `convex-test` for behavior tests and include helper setup.

This should be treated as your baseline architecture.

---

## Analysis of your current packages

### `packages/better-sslcommerz`

Key files:

- `packages/better-sslcommerz/src/client.ts`
- `packages/better-sslcommerz/src/endpoints/core.ts`
- `packages/better-sslcommerz/src/endpoints/invoice.ts`
- `packages/better-sslcommerz/src/http.ts`
- `packages/better-sslcommerz/src/internal.ts`
- `packages/better-sslcommerz/src/types.ts`
- `packages/better-sslcommerz/src/errors.ts`

Strengths:

- Already has endpoint coverage needed for first Convex component version:
  - create session
  - order validation
  - refund initiate/status
  - transaction query
  - create invoice
  - invoice status/cancel
- Already has robust request transport and error model.
- Already has input/output validation integration.

Gaps for direct Convex component publishing:

- No Convex component layout yet.
- No component schema/storage model for session/transaction history.
- No webhook route helper.
- Package currently built as SDK only.

### `packages/validators`

Key files:

- `packages/validators/src/core/*.ts`
- `packages/validators/src/invoice/*.ts`
- `packages/validators/src/shared/*.ts`
- `packages/validators/package.json`

Strengths:

- Good schema organization and reusable type exports.
- Strong base for shared validation between SDK and component package.

Critical packaging caveat:

- `packages/validators/package.json` has `"private": true` and exports source (`"default": "./src/index.ts"`).
- This is fine inside monorepo development, but not enough for independent npm consumption by external apps.

If your Convex component will be published publicly, validators packaging strategy must be addressed.

---

## Reuse opinion: can current `@better-sslcommerz/sdk` package be reused?

Short answer: **Yes, partially and effectively**, with conditions.

### Reuse feasibility matrix

1. Reuse validators in component package: **Highly recommended and low risk**.
2. Reuse SDK runtime client (`createSslcommerzClient`) from component wrapper: **Possible and efficient**.
3. Reuse SDK files directly by copy-pasting into component: **Possible but not recommended** (drift risk).
4. Reuse SDK as external dependency for published component: **Depends on publishing/versioning stability**.

### My recommended approach

Use a **hybrid approach**:

- Keep component package architecture like Stripe/Polar.
- Rebuild Convex-specific layer (schema, component functions, route registration, test helpers).
- Reuse your existing SDK package for outbound SSLCommerz HTTP calls in the client wrapper layer.
- Reuse validators directly for component/API payload validation.

This gives you fastest delivery without violating component design principles.

---

## If you decide NOT to reuse runtime SDK

It is still compatible to rebuild everything in the Convex package while keeping API parity.

To stay compatible with current API behavior, you must carry over:

- endpoint paths from:
  - `packages/better-sslcommerz/src/endpoints/core.ts`
  - `packages/better-sslcommerz/src/endpoints/invoice.ts`
- transport semantics from:
  - `packages/better-sslcommerz/src/http.ts`
- error contracts from:
  - `packages/better-sslcommerz/src/errors.ts`
- validation flow from:
  - `packages/better-sslcommerz/src/internal.ts`

This is workable but doubles maintenance burden.

---

## Proposed new package: `packages/better-sslcommerz-convex`

Recommended package name (pick one):

1. `@better-sslcommerz/convex` (recommended)
2. `@better-sslcommerz/component`
3. `better-sslcommerz-convex`

Recommended structure:

```text
packages/better-sslcommerz-convex/
  package.json
  convex.json
  tsconfig.json
  tsconfig.build.json
  tsconfig.test.json
  vitest.config.ts
  eslint.config.ts
  src/
    client/
      index.ts
      types.ts
      setup.test.ts
      index.test.ts
      _generated/_ignore.ts
    component/
      convex.config.ts
      schema.ts
      public.ts
      private.ts
      util.ts
      setup.test.ts
      public.test.ts
      _generated/
        api.ts
        component.ts
        dataModel.ts
        server.ts
    react/
      index.tsx          # optional in v1
    test.ts              # register helper for consumers
  example/
    convex/
      convex.config.ts
      http.ts
      sslcommerz.ts
      schema.ts
      setup.test.ts
    src/
      App.tsx
```

---

## Proposed exports and package.json model

Match Stripe/Polar export style:

- `.` -> client wrapper API
- `./convex.config` + `./convex.config.js`
- `./_generated/component.js`
- `./react` (if UI helper exists)
- `./test` (test registration helper)
- `./package.json`

Also include:

- `peerDependencies`: `convex`, `react` (if `react` subpath exists)
- `files`: `dist`, `src`
- scripts for:
  - codegen
  - build
  - typecheck
  - lint
  - test

---

## Data model plan for SSLCommerz component

Recommended initial tables:

1. `sessions`
   - `tranId`, `sessionKey`, `status`, `gatewayPageUrl`, `amount`, `currency`, `createdAt`
   - indexes: `by_tran_id`, `by_session_key`, `by_status`
2. `transactions`
   - canonical validated transaction records (`tranId`, `valId`, `status`, `amount`, `currency`, `bankTranId`, `riskLevel`, `raw`)
   - indexes: `by_tran_id`, `by_val_id`, `by_status`
3. `refunds`
   - `refundRefId`, `refundTransId`, `bankTranId`, `status`, `amount`, `initiatedOn`, `refundedOn`
   - indexes: `by_refund_ref_id`, `by_refund_trans_id`, `by_bank_tran_id`
4. `invoices`
   - `invoiceId`, `refer`, `tranId`, `paymentStatus`, `payUrl`, `qrImageUrl`, `status`, `raw`
   - indexes: `by_invoice_id`, `by_refer`, `by_tran_id`, `by_payment_status`
5. `ipn_events`
   - raw IPN payload snapshots + processing state for idempotency.
   - indexes: `by_tran_id`, `by_val_id`, `by_status`

Optional later:

- `merchants`/`store_profiles` if multi-store support is needed.

---

## API compatibility plan (existing SDK -> Convex component)

Current SDK methods:

- `core.createSession`
- `core.validateOrder`
- `core.refundInitiate`
- `core.refundStatus`
- `core.transactionQueryBySession`
- `core.transactionQueryByTranId`
- `core.parseIpnPayload`
- `invoice.createInvoice`
- `invoice.invoiceStatus`
- `invoice.invoiceCancel`

Component package should expose equivalent high-level methods on class, e.g.:

- `sslcommerz.createSession(ctx, args)`
- `sslcommerz.validateOrder(ctx, args)`
- `sslcommerz.refundInitiate(ctx, args)`
- `sslcommerz.refundStatus(ctx, args)`
- `sslcommerz.transactionQueryBySession(ctx, args)`
- `sslcommerz.transactionQueryByTranId(ctx, args)`
- `sslcommerz.createInvoice(ctx, args)`
- `sslcommerz.invoiceStatus(ctx, args)`
- `sslcommerz.invoiceCancel(ctx, args)`
- `sslcommerz.parseIpnPayload(payload)`
- `sslcommerz.registerRoutes(http, options)`

And component public queries for dashboard/internal app usage:

- `public.getSessionByTranId`
- `public.getTransactionByTranId`
- `public.listTransactionsByStatus`
- `public.getInvoice`
- `public.listInvoicesByPaymentStatus`
- `public.getRefundByRefId`

---

## Two-track implementation plan

## Track A (recommended): Reuse runtime SDK + validators

### Why this is best

- Minimum risk and fastest path.
- Maintains compatibility with your already-tested API behavior.
- Keeps Convex-specific code focused on storage, routing, and component boundary.

### Implementation steps

1. Create package scaffold `packages/better-sslcommerz-convex` following Stripe/Polar layout.
2. Build component internals (`schema.ts`, `public.ts`, `private.ts`) focused on persistence and querying.
3. Build client wrapper class that internally uses `createSslcommerzClient(...)` from `@better-sslcommerz/sdk`.
4. Implement `registerRoutes` for IPN endpoint:
   - parse with validator
   - persist IPN event
   - optionally call `validateOrder`
   - trigger user custom handlers
5. Create `src/test.ts` registration helper.
6. Add `example/convex/*` showing install + webhook + action wrappers.
7. Add `convex-test` suites.

### Risks

- Dependency coupling to `@better-sslcommerz/sdk` release cadence.

---

## Track B: Standalone component runtime (no SDK runtime reuse)

### Why you might choose this

- Full independence for package distribution.
- No runtime dependency on `@better-sslcommerz/sdk`.

### Implementation steps

1. Build HTTP transport in component client package (copy behavior, not files).
2. Re-implement endpoint wrappers.
3. Reuse validators as shared dependency.
4. Keep same component and route architecture as Track A.

### Risks

- Duplicate logic between SDK and component package.
- Higher maintenance and divergence risk.

---

## Validators strategy for component package

You requested using same validators in the Convex component package. That is correct and should be done.

Recommended options:

1. Internal workspace-only (fastest now)
   - Keep validators private; consume with workspace linking.
2. Publish-ready (recommended for npm component)
   - Make `@better-sslcommerz/validators` publishable:
     - remove `private: true`
     - add version
     - export built JS (`dist/index.js`) + types

Without this, external users cannot reliably consume validators through npm.

---

## Convex-specific design constraints to enforce

From component best practices and Stripe/Polar patterns:

1. Do not use `ctx.auth` inside component functions.
2. Do not depend on component-side `process.env` for secrets.
3. Keep secret access in app/client wrapper layer.
4. Keep parent app IDs crossing boundary as strings.
5. Mount HTTP routes in app `convex/http.ts`, not inside component directly.
6. Use `args` + `returns` validators on all public functions.

---

## Detailed milestone plan

### Milestone 1: package skeleton and tooling

Deliverables:

- package scaffold
- package exports map
- tsconfig/build/lint/test scripts
- convex codegen wiring

### Milestone 2: component schema + persistence API

Deliverables:

- `src/component/schema.ts`
- `src/component/public.ts`
- `src/component/private.ts`
- component tests for insert/update/query flows

### Milestone 3: runtime class and endpoint methods

Deliverables:

- `src/client/index.ts`
- optional `src/client/types.ts`
- methods mirroring existing SDK capability

### Milestone 4: webhook/IPN registration and custom handlers

Deliverables:

- `registerRoutes(http, component, config)`
- idempotency + logging strategy
- tests for route handler behavior

### Milestone 5: example app + docs + test helper

Deliverables:

- `example/` app proving end-to-end setup
- `src/test.ts` helper for consumers
- README with install, setup, env, route, and API examples

### Milestone 6: publish hardening

Deliverables:

- final exports validation
- package smoke test from packed tarball
- peer dependency checks

---

## Immediate next execution plan (practical)

1. Create `packages/better-sslcommerz-convex` using Stripe/Polar package skeleton.
2. Implement Track A first (reuse `@better-sslcommerz/sdk` runtime client + validators).
3. Add minimal v1 component tables (`sessions`, `transactions`, `refunds`, `invoices`, `ipn_events`).
4. Add class methods with same method names as current SDK for easy adoption.
5. Add `registerRoutes` + custom event hooks.
6. Add test helper and example app.
7. Decide whether validators should be publishable before public release.

---

## Final recommendation

Use **Track A now** for speed and stability, but structure code so Track B remains possible later.

That means:

- Rebuild Convex layer as a real component package (like Stripe/Polar).
- Reuse existing validated endpoint runtime from `@better-sslcommerz/sdk`.
- Reuse `@better-sslcommerz/validators` as shared schema contract.
- Plan one later step to make validators publish-safe if this component is meant for public npm.

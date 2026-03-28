# Convex Final Plan (`@better-sslcommerz/convex`)

## 1) Scope and final objective

This plan is the merged, final execution plan after analyzing:

- `better-sslcommerz-convex-plan.md`
- `better-sslcommerz-convex-kimi-plan.md`
- Convex component docs (via Context7)
- local reference implementations:
  - `demo-project/stripe`
  - `demo-project/polar`

Primary goal:

- Build a production-ready Convex **component package** in `packages/convex` with package name `@better-sslcommerz/convex`.
- Follow the same packaging and component architecture standard as Stripe/Polar component packages.
- Reuse `@better-sslcommerz/sdk` runtime client for SSLCommerz API calls.

Out of scope for now:

- `example/` app folder and example integration.
- UI components beyond a minimal React stub.

---

## 2) Current baseline vs target

Current state in `packages/convex` is a backend-style starter (Convex app package shape), not yet a component package shape.

Key gaps to close:

1. Move from `convex/*` backend layout to `src/component + src/client` component layout.
2. Replace current exports (`./dataModel`, `./server`, etc.) with component package exports (`./convex.config(.js)`, `./_generated/component.js`, etc.).
3. Add component codegen workflow (`convex codegen --component-dir ./src/component`).
4. Add proper component public/internal API surface.
5. Add wrapper class that imports and uses `createSslcommerzClient` from `@better-sslcommerz/sdk`.

---

## 3) Architecture decisions (after comparing both plans)

## 3.1 Reuse strategy

- Choose **Track A** (recommended in both plans):
  - Reuse `@better-sslcommerz/sdk` runtime client.
  - Reuse validator exports from `@better-sslcommerz/sdk`.
  - Build Convex-specific schema, component functions, and route registration in this package.

## 3.2 Component function organization

- Use **Stripe-style split**:
  - `src/component/public.ts` for app-facing queries/mutations/actions.
  - `src/component/internal.ts` for route/internal write flows and idempotent handlers.

Reason:

- SSLCommerz IPN + redirect flow maps better to explicit internal handler layer than a single `lib.ts` file.

## 3.3 Export strategy

- Use **Polar-compatible export style** for broader compatibility:
  - include both `./convex.config` and `./convex.config.js`.
- include `./_generated/component.js` types export.
- include `./test` helper export.

## 3.4 Build strategy

- Use **plain TypeScript build (`tsc`)**, not `tsdown`/bundling, for component package.
- Keep `src/component/_generated/*` committed (component typing contract).

## 3.5 Convex constraints to enforce

- Component config via `defineComponent("sslcommerz")`.
- Use component-local generated helpers in component files:
  - `import { query, mutation, action } from "./_generated/server.js"`
- Keep secrets/env in wrapper/runtime side; no secret dependency in pure component mutation/query logic.
- Do not depend on app auth internals in component layer.

---

## 4) Target project structure (package-only, no example yet)

```text
packages/convex/
  package.json
  convex.json
  tsconfig.json
  tsconfig.build.json
  tsconfig.test.json
  vitest.config.ts
  eslint.config.ts
  .gitignore
  README.md

  src/
    index.ts
    test.ts
    react/
      index.ts

    client/
      index.ts
      types.ts
      setup.test.ts
      index.test.ts
      _generated/
        _ignore.ts

    component/
      convex.config.ts
      schema.ts
      public.ts
      internal.ts
      setup.test.ts
      public.test.ts
      _generated/
        api.ts
        server.ts
        dataModel.ts
        component.ts
```

Migration note:

- Existing `packages/convex/convex/*` files become temporary scaffolding and should be replaced by `src/component/*` structure above.

---

## 5) File-by-file motive and references

| Target file | Motive | Main reference standard |
| --- | --- | --- |
| `packages/convex/package.json` | Component package identity, scripts, exports, deps | `demo-project/stripe/package.json`, `demo-project/polar/package.json` |
| `packages/convex/convex.json` | Convex project config and codegen settings | `demo-project/stripe/convex.json` |
| `packages/convex/tsconfig.json` | base TS config for src + tests | `demo-project/stripe/tsconfig.json`, `demo-project/polar/tsconfig.json` |
| `packages/convex/tsconfig.build.json` | build-only TS compile graph | `demo-project/stripe/tsconfig.build.json` |
| `packages/convex/tsconfig.test.json` | test typing setup | `demo-project/stripe/tsconfig.test.json` |
| `packages/convex/vitest.config.ts` | test runtime configuration | `demo-project/stripe/vitest.config.js`, `demo-project/polar/vitest.config.mts` |
| `packages/convex/eslint.config.ts` | lint policy for component/client | `demo-project/stripe/eslint.config.js` |
| `packages/convex/src/component/convex.config.ts` | defines component namespace (`sslcommerz`) | `demo-project/stripe/src/component/convex.config.ts` |
| `packages/convex/src/component/schema.ts` | Convex data model for sessions/tx/refund/invoice/ipn | `demo-project/stripe/src/component/schema.ts`, SSLCommerz domain from both plans |
| `packages/convex/src/component/public.ts` | app-facing typed query/mutation/action API | `demo-project/stripe/src/component/public.ts` |
| `packages/convex/src/component/internal.ts` | idempotent write paths and route/internal handlers | `demo-project/stripe/src/component/private.ts` |
| `packages/convex/src/component/_generated/*` | generated component API contract for consumers | `demo-project/stripe/src/component/_generated/component.ts` |
| `packages/convex/src/client/types.ts` | wrapper-level context and API types | `demo-project/stripe/src/client/types.ts`, `demo-project/polar/src/component/util.ts` |
| `packages/convex/src/client/index.ts` | `SslCommerzConvex` class + `registerRoutes` | `demo-project/stripe/src/client/index.ts`, `demo-project/polar/src/client/index.ts` |
| `packages/convex/src/index.ts` | package root exports (class + helpers + types) | Stripe/Polar root exports pattern |
| `packages/convex/src/react/index.ts` | optional React stub export for parity | `demo-project/stripe/src/react/index.ts` |
| `packages/convex/src/test.ts` | consumer `convex-test` registration helper | `demo-project/polar/src/test.ts` |
| `packages/convex/src/component/setup.test.ts` | component test harness setup | `demo-project/stripe/src/component/setup.test.ts` |
| `packages/convex/src/component/public.test.ts` | component behavior tests | `demo-project/stripe/src/component/public.test.ts` |
| `packages/convex/src/client/setup.test.ts` | wrapper test setup | `demo-project/stripe/src/client/setup.test.ts` |
| `packages/convex/src/client/index.test.ts` | wrapper and route behavior tests | `demo-project/stripe/src/client/index.test.ts`, `demo-project/polar/src/client/index.test.ts` |

SDK integration references (must be reused):

- `packages/better-sslcommerz/src/client.ts`
- `packages/better-sslcommerz/src/types.ts`
- `packages/better-sslcommerz/src/index.ts`

---

## 6) Data model plan (v1)

Tables and indexes for v1 component schema:

1. `paymentSessions`
   - fields: `tranId`, `sessionKey`, `gatewayUrl`, `status`, `amount`, `currency`, `environment`, optional `userId`, `orgId`, `metadata`, `valId`, `bankTranId`, `cardType`, `storeAmount`, `expiresAt`
   - indexes: `by_tran_id`, `by_session_key`, `by_status`, `by_user_id`, `by_org_id`, `by_val_id`

2. `transactions`
   - fields: normalized validation result (`tranId`, `valId`, `status`, `amount`, `currency`, `bankTranId`, `riskLevel`, `raw`)
   - indexes: `by_tran_id`, `by_val_id`, `by_status`

3. `refunds`
   - fields: `refundRefId`, `refundTransId`, `bankTranId`, `status`, `amount`, `initiatedOn`, `refundedOn`, `raw`
   - indexes: `by_refund_ref_id`, `by_refund_trans_id`, `by_bank_tran_id`, `by_status`

4. `invoices`
   - fields: `invoiceId`, `refer`, `tranId`, `paymentStatus`, `payUrl`, `qrImageUrl`, `status`, `raw`
   - indexes: `by_invoice_id`, `by_refer`, `by_tran_id`, `by_payment_status`

5. `ipnEvents`
   - fields: `tranId`, `valId`, `status`, `amount`, `storeAmount`, `currency`, `bankTranId`, `cardType`, optional `cardNo`, optional `riskLevel`, optional `riskTitle`, `verified`, `rawPayload`
   - indexes: `by_tran_id`, `by_val_id`, `by_status`

Important behavior constraints:

- `valId` should drive idempotency for IPN writes.
- keep raw payload snapshots for audit/debug.
- public functions should return schema validator shapes without `_id` and `_creationTime`.

---

## 7) Wrapper API plan (`src/client/index.ts`)

Main class: `SslCommerzConvex`

Core methods (initial set):

- `createPaymentSession(ctx, args)`
- `validateOrder(ctx, args)`
- `refundInitiate(ctx, args)`
- `refundStatus(ctx, args)`
- `transactionQueryBySession(ctx, args)`
- `transactionQueryByTranId(ctx, args)`
- `createInvoice(ctx, args)`
- `invoiceStatus(ctx, args)`
- `invoiceCancel(ctx, args)`
- `parseIpnPayload(payload)`
- read helpers delegating to public queries
- `registerRoutes(http, config)` for IPN and redirect endpoints

Route defaults:

- `/sslcommerz/ipn`
- `/sslcommerz/success`
- `/sslcommerz/fail`
- `/sslcommerz/cancel`

Route behavior:

1. Parse `application/x-www-form-urlencoded` body.
2. Validate payload via SDK validator/parsing utilities.
3. Record IPN event idempotently via internal mutation.
4. Validate order with SSLCommerz API.
5. Upsert transaction/session status.
6. Invoke optional user callbacks.

---

## 8) `package.json` blueprint (component standard)

Required export shape (component package standard):

```json
{
  "name": "@better-sslcommerz/convex",
  "type": "module",
  "files": ["dist", "src"],
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "types": "./dist/client/index.d.ts",
      "default": "./dist/client/index.js"
    },
    "./react": {
      "types": "./dist/react/index.d.ts",
      "default": "./dist/react/index.js"
    },
    "./test": "./src/test.ts",
    "./_generated/component.js": {
      "types": "./dist/component/_generated/component.d.ts"
    },
    "./convex.config": {
      "types": "./dist/component/convex.config.d.ts",
      "default": "./dist/component/convex.config.js"
    },
    "./convex.config.js": {
      "types": "./dist/component/convex.config.d.ts",
      "default": "./dist/component/convex.config.js"
    }
  }
}
```

Dependency strategy:

- runtime dependency: `@better-sslcommerz/sdk`
- peer dependency: `convex`
- optional peer: `react` (if keeping `/react` export)

Build/codegen scripts to include:

- `build`: `tsc --project ./tsconfig.build.json`
- `build:codegen`: `convex codegen --component-dir ./src/component && pnpm run build`
- `typecheck`: `tsc --noEmit`
- `lint`, `test`

---

## 9) Comparative TODO tracker (step-by-step, package-only)

How to use this tracker:

- Work top to bottom.
- Mark `[x]` when each step is complete.
- Do not start example app work until Phase 9 is complete.

## Phase 0 - baseline and migration setup

- [x] **P0.1** Freeze package target to `@better-sslcommerz/convex` and component name `sslcommerz`.
- [x] **P0.2** Mark current backend-style files as migration targets (`packages/convex/convex/*` -> `packages/convex/src/component/*`).
- [x] **P0.3** Add/confirm `convex.json` with component-friendly codegen settings.

Reference standard:

- `demo-project/stripe/convex.json`
- `demo-project/polar/convex.json`

## Phase 1 - package scaffolding and config parity

- [x] **P1.1** Create `src/` tree (`component`, `client`, `react`, root index/test).
- [x] **P1.2** Update `package.json` to component export map (including `./convex.config` and `./convex.config.js`).
- [x] **P1.3** Add `tsconfig.json`, `tsconfig.build.json`, `tsconfig.test.json` aligned with Stripe/Polar pattern.
- [x] **P1.4** Add `vitest.config.ts` and extend lint rules/ignores for generated files.

Reference standard:

- `demo-project/stripe/package.json`
- `demo-project/polar/package.json`
- `demo-project/stripe/tsconfig.json`
- `demo-project/stripe/tsconfig.build.json`
- `demo-project/stripe/tsconfig.test.json`
- `demo-project/stripe/vitest.config.js`

## Phase 2 - component declaration and schema

- [x] **P2.1** Implement `src/component/convex.config.ts` with `defineComponent("sslcommerz")`.
- [x] **P2.2** Replace demo schema with v1 tables (`paymentSessions`, `transactions`, `refunds`, `invoices`, `ipnEvents`).
- [x] **P2.3** Add all planned indexes and ensure query patterns are index-backed.

Reference standard:

- `demo-project/stripe/src/component/convex.config.ts`
- `demo-project/stripe/src/component/schema.ts`
- `demo-project/polar/src/component/schema.ts`

## Phase 3 - public component API

- [x] **P3.1** Build public query API in `src/component/public.ts` (get/list session, transaction, invoice, refund, ipn).
- [x] **P3.2** Build public mutations for controlled writes and status transitions.
- [x] **P3.3** Return validator-safe objects without system fields.

Reference standard:

- `demo-project/stripe/src/component/public.ts`

## Phase 4 - internal component API (idempotent handlers)

- [x] **P4.1** Build `src/component/internal.ts` for IPN recording and status sync.
- [x] **P4.2** Implement idempotency guard by `valId`.
- [x] **P4.3** Add stale update guards where needed (timestamp/status precedence).

Reference standard:

- `demo-project/stripe/src/component/private.ts`
- `demo-project/polar/src/component/lib.ts` (timestamp guard patterns)

## Phase 5 - generate component API contract

- [x] **P5.1** Run `convex codegen --component-dir ./src/component`.
- [x] **P5.2** Commit generated `src/component/_generated/*`.
- [x] **P5.3** Validate imports in component files use `./_generated/server.js`.

Reference standard:

- `demo-project/stripe/src/component/_generated/component.ts`
- `demo-project/polar/src/component/_generated/component.ts`

## Phase 6 - client wrapper using `@better-sslcommerz/sdk`

- [x] **P6.1** Define wrapper and route config types in `src/client/types.ts`.
- [x] **P6.2** Implement `SslCommerzConvex` class in `src/client/index.ts`.
- [x] **P6.3** Integrate `createSslcommerzClient` for all outbound SSLCommerz API calls.
- [x] **P6.4** Add read/write bridges using `ctx.runQuery` and `ctx.runMutation` to component API.

Reference standard:

- `demo-project/stripe/src/client/index.ts`
- `demo-project/stripe/src/client/types.ts`
- `demo-project/polar/src/client/index.ts`
- `packages/better-sslcommerz/src/client.ts`
- `packages/better-sslcommerz/src/types.ts`

## Phase 7 - HTTP route registration

- [x] **P7.1** Implement `registerRoutes(http, component, config)` helper export.
- [x] **P7.2** Add IPN handler path with parsing, validation, idempotent recording, and verification.
- [x] **P7.3** Add success/fail/cancel handlers and optional callbacks.
- [x] **P7.4** Ensure route handlers return stable HTTP responses and do not leak secrets.

Reference standard:

- `demo-project/stripe/src/client/index.ts` (`registerRoutes`)
- `demo-project/polar/src/client/index.ts` (`registerRoutes`)

## Phase 8 - package entrypoints and helper surfaces

- [x] **P8.1** Add `src/index.ts` export barrel.
- [x] **P8.2** Add `src/react/index.ts` stub.
- [x] **P8.3** Add `src/test.ts` register helper for `convex-test`.
- [x] **P8.4** Verify package exports resolve all entrypoints.

Reference standard:

- `demo-project/polar/src/test.ts`
- `demo-project/stripe/src/react/index.ts`

## Phase 9 - tests and quality gates

- [x] **P9.1** Add component tests (`setup.test.ts`, `public.test.ts`).
- [x] **P9.2** Add client tests (`setup.test.ts`, `index.test.ts`).
- [x] **P9.3** Add route tests for IPN/success/fail/cancel parsing and callback behavior.
- [x] **P9.4** Pass `lint`, `typecheck`, `test`, and `build:codegen`.

Reference standard:

- `demo-project/stripe/src/component/setup.test.ts`
- `demo-project/stripe/src/component/public.test.ts`
- `demo-project/stripe/src/client/setup.test.ts`
- `demo-project/stripe/src/client/index.test.ts`
- `demo-project/polar/src/component/lib.test.ts`

## Phase 10 - monorepo and release hardening

- [x] **P10.1** Confirm `pnpm-workspace.yaml`/catalog entries remain correct for component deps.
- [x] **P10.2** Confirm `turbo.json` env and task behavior for component build/test flow.
- [x] **P10.3** Pack and smoke-test package exports (`npm pack --ignore-scripts` succeeds; tarball install validated up to external unpublished dependency constraints).
- [x] **P10.4** Prepare release checklist for publish mode (remove `private` when ready).

---

## 10) Required reference files (do not deviate without reason)

Stripe package references:

- `demo-project/stripe/package.json`
- `demo-project/stripe/convex.json`
- `demo-project/stripe/tsconfig.json`
- `demo-project/stripe/tsconfig.build.json`
- `demo-project/stripe/tsconfig.test.json`
- `demo-project/stripe/eslint.config.js`
- `demo-project/stripe/vitest.config.js`
- `demo-project/stripe/src/component/convex.config.ts`
- `demo-project/stripe/src/component/schema.ts`
- `demo-project/stripe/src/component/public.ts`
- `demo-project/stripe/src/component/private.ts`
- `demo-project/stripe/src/client/index.ts`
- `demo-project/stripe/src/client/types.ts`

Polar package references:

- `demo-project/polar/package.json`
- `demo-project/polar/src/component/lib.ts`
- `demo-project/polar/src/component/util.ts`
- `demo-project/polar/src/client/index.ts`
- `demo-project/polar/src/test.ts`

In-repo SDK references:

- `packages/better-sslcommerz/src/index.ts`
- `packages/better-sslcommerz/src/client.ts`
- `packages/better-sslcommerz/src/types.ts`

---

## 11) Deferred work (explicitly postponed)

These are intentionally deferred until the package core is stable:

- `example/` app setup and demo integration.
- advanced React components (beyond `src/react/index.ts` stub).
- full publish automation/versioning workflow docs.

---

## 12) Definition of done for package-core milestone

Package-core is complete when all are true:

1. Component export map matches component standard entrypoints.
2. `src/component/_generated/component.ts` exists and is committed.
3. `SslCommerzConvex` wrapper can create session and process IPN path end-to-end (test-covered).
4. Lint/typecheck/test/build:codegen pass in `packages/convex`.
5. No dependency on `example/` for package-core validation.

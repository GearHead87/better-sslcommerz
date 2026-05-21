# Convex Component Progress Summary (`@better-sslcommerz/convex`)

This document tracks what has been completed phase-by-phase from `convex-final-plan.md`, what changed in each phase, and what remains.

## Phase 0 - baseline and migration setup

Status: complete

- Locked package target to `@better-sslcommerz/convex` and component namespace `sslcommerz`.
- Migrated work away from backend-style `packages/convex/convex/*` layout toward `packages/convex/src/component/*` + `src/client/*`.
- Added `packages/convex/convex.json` for component-oriented Convex configuration.

## Phase 1 - package scaffolding and config parity

Status: complete

- Created component-style source structure under `packages/convex/src/`.
- Updated `packages/convex/package.json` exports/scripts to align with Stripe/Polar patterns.
- Added/updated TypeScript configs:
  - `packages/convex/tsconfig.json`
  - `packages/convex/tsconfig.build.json`
  - `packages/convex/tsconfig.test.json`
- Added `packages/convex/vitest.config.ts`.
- Updated lint and ignore configuration:
  - `packages/convex/eslint.config.ts`
  - `packages/convex/.gitignore`

## Phase 2 - component declaration and schema

Status: complete

- Implemented component declaration at `packages/convex/src/component/convex.config.ts` with `defineComponent("sslcommerz")`.
- Implemented v1 schema in `packages/convex/src/component/schema.ts` including:
  - `paymentSessions`
  - `transactions`
  - `refunds`
  - `invoices`
  - `ipnEvents`
- Added indexes for tran/session/val/status/user/org and related query paths.

## Phase 3 - public component API

Status: complete

- Implemented app-facing query/mutation APIs in `packages/convex/src/component/public.ts` for sessions, transactions, refunds, invoices, and IPN events.
- Added upsert-style mutation flows and session status updates.
- Normalized return shapes by omitting Convex system fields (`_id`, `_creationTime`).

## Phase 4 - internal component API (idempotent handlers)

Status: complete

- Implemented internal mutation flows in `packages/convex/src/component/internal.ts`.
- Added idempotent IPN recording keyed by `valId`.
- Added gateway-to-session status sync helpers and explicit session status setter.

## Phase 5 - generated component API contract

Status: complete

- `P5.1` complete: `convex codegen --component-dir ./src/component` runs successfully with local env loaded.
- `P5.2` complete: generated files are present in `packages/convex/src/component/_generated/*` (including `component.ts`).
- `P5.3` complete: component files use `./_generated/server.js` imports.
- Note: Convex codegen currently requires package-root `convex.config.js` to be present during generation in this workspace layout.

## Phase 6 - client wrapper using `@better-sslcommerz/sdk`

Status: complete

- Implemented wrapper types in `packages/convex/src/client/types.ts`.
- Implemented `SslCommerzConvex` in `packages/convex/src/client/index.ts`.
- Wired SDK calls via `createSslcommerzClient` for:
  - payment session creation
  - order validation
  - refund initiate/status
  - transaction query by session/tranId
  - invoice create/status/cancel
- Added read bridges to public queries and write bridges to public/internal mutations.
- Fixed `types.ts` to infer request/response types from `createSslcommerzClient` method signatures so package typecheck/build pass consistently.

## Phase 7 - HTTP route registration

Status: complete

- Implemented route registration in `packages/convex/src/client/index.ts`:
  - `/sslcommerz/ipn`
  - `/sslcommerz/success`
  - `/sslcommerz/fail`
  - `/sslcommerz/cancel`
- Added form parsing, payload validation, idempotent IPN recording, verification attempts, session status updates, and optional callbacks.
- Added redirect behavior for success/fail/cancel flows.

## Phase 8 - package entrypoints and helper surfaces

Status: complete

- Added package root barrel at `packages/convex/src/index.ts`.
- Added React stub export at `packages/convex/src/react/index.ts`.
- Added `convex-test` helper at `packages/convex/src/test.ts`.
- Verified exports resolve under lint/typecheck/build.

## Phase 9 - tests and quality gates

Status: complete

- `P9.1` complete: component tests added:
  - `packages/convex/src/component/setup.test.ts`
  - `packages/convex/src/component/public.test.ts`
- `P9.2` complete: client tests added:
  - `packages/convex/src/client/setup.test.ts`
  - `packages/convex/src/client/index.test.ts`
- `P9.3` complete: expanded route tests now cover IPN/success/fail/cancel behavior, redirect handling, payload parsing failure, and callback invocation.
- `P9.4` complete:
  - `lint` passes
  - `typecheck` passes
  - `test` passes
  - `build` passes
  - `build:codegen` passes when `.env.local` is loaded

## Phase 10 - monorepo and release hardening

Status: complete (with publish-time caveats)

- Updated `turbo.json` global env entries to include:
  - `SSLCOMMERZ_ENVIRONMENT`
  - `SSLCOMMERZ_STORE_ID`
  - `SSLCOMMERZ_STORE_PASSWD`
- `P10.3` complete:
  - Added package `version` (`0.0.0`) in `packages/convex/package.json`.
  - `npm pack --ignore-scripts` succeeds and produces a valid tarball.
  - Tarball install was tested with publish-ready dependency mapping.
- `P10.4` complete:
  - Added release checklist guidance and current caveats in this summary.
  - Package is publish-ready via `publishConfig.access: "public"` and release automation.

## Current status snapshot

- Main wrapper/component implementation is in place.
- Full package quality gates are green, including component codegen in local Convex setup.
- Planning phases P0-P10 are now implemented for package-core and hardening scope.
- Runtime dependency now targets `@better-sslcommerz/sdk` in workspace and publish outputs.

## Suggested next actions

1. Publish in lockstep via Changesets release flow (`@better-sslcommerz/validators`, `@better-sslcommerz/sdk`, `@better-sslcommerz/convex`).
2. Ensure `NPM_TOKEN` has publish rights for the `@better-sslcommerz` scope.
3. Keep repository public for npm provenance verification in GitHub Actions.

## Release checklist (P10.4 artifact)

- Ensure `@better-sslcommerz/sdk` is published (or otherwise resolvable) for external installs.
- Confirm `@better-sslcommerz/convex` `version` is set to intended release value.
- Run:
  - `pnpm --filter @better-sslcommerz/convex build:codegen` (with env loaded)
  - `pnpm --filter @better-sslcommerz/convex lint`
  - `pnpm --filter @better-sslcommerz/convex typecheck`
  - `pnpm --filter @better-sslcommerz/convex test`
  - `pnpm --filter @better-sslcommerz/convex build`
  - `npm pack --ignore-scripts`
- Verify tarball contains expected entrypoints:
  - `dist/client/index.js`
  - `dist/component/convex.config.js`
  - `dist/component/_generated/component.d.ts`
  - `convex.config.js`
- In a clean non-workspace temp dir, install tarball and verify ESM import resolves.
- Verify published package metadata in npm after release.

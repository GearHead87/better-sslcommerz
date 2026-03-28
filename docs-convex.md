# Convex Component Docs — Plan

## Context

The `@better-sslcommerz/convex` package is a Convex component that persists SSLCommerz payment
data (sessions, transactions, refunds, invoices, IPN events) into a Convex database and registers
HTTP route handlers for gateway callbacks.

The existing docs cover only the vanilla `better-sslcommerz` SDK. These new pages document the
Convex component for developers who want to add it to their Convex application.

Style reference: `demo-project/polar/README.md` and `demo-project/stripe/README.md`.

---

## Navigation — New Section

Add a **"Convex Component"** group to the navigation in `src/site-config.ts`, after the existing
"Reference" group:

```ts
{
  title: "Convex Component",
  links: [
    { href: "/convex",                   title: "Overview"         },
    { href: "/convex/installation",      title: "Installation"     },
    { href: "/convex/quick-start",       title: "Quick Start"      },
    { href: "/convex/http-routes",       title: "HTTP Routes"      },
    { href: "/convex/reading-data",      title: "Reading Data"     },
    { href: "/convex/database-schema",   title: "Database Schema"  },
    { href: "/convex/api-reference",     title: "API Reference"    },
    { href: "/convex/testing",           title: "Testing"          },
  ],
},
```

---

## Pages to Add

### 1. `/convex` — Overview

**File:** `src/app/(docs)/convex/page.mdx`

What to cover:
- One-sentence description: a Convex component that persists all SSLCommerz gateway activity and
  registers HTTP callback routes.
- Feature list:
  - Persistent storage for payment sessions, transactions, refunds, invoices, and IPN events.
  - Built-in HTTP route handlers for IPN webhook, success, fail, and cancel redirects.
  - Query helpers to read stored payment data from any Convex function.
  - Automatic upsert — every gateway call syncs the relevant records.
  - Typed with TypeScript; works with `convex-test` for unit testing.
- Prerequisites: an existing Convex project (`convex ^1.31.6`), a `better-sslcommerz` client, and
  SSLCommerz store credentials.
- Short teaser code block showing the constructor and `registerRoutes` call (lifted from the polar
  README pattern).
- Link forward to `/convex/installation`.

---

### 2. `/convex/installation` — Installation

**File:** `src/app/(docs)/convex/installation/page.mdx`

Steps (follow the stripe quick-start numbered pattern):

1. **Install the package**
   ```bash
   npm install @better-sslcommerz/convex
   # peer dep
   npm install convex
   ```

2. **Register the component in `convex.config.ts`**
   ```ts
   import { defineApp } from "convex/server";
   import sslcommerz from "@better-sslcommerz/convex/convex.config";

   const app = defineApp();
   app.use(sslcommerz);
   export default app;
   ```

3. **Run codegen** to generate types for the component:
   ```bash
   npx convex dev
   ```

4. **Set environment variables** in the Convex dashboard or `.env.local`:
   ```
   SSLCOMMERZ_STORE_ID=your_store_id
   SSLCOMMERZ_STORE_PASSWD=your_store_password
   SSLCOMMERZ_ENVIRONMENT=sandbox   # or "live"
   ```
   Note: these can also be passed directly to the `SslCommerzConvex` constructor — env vars are a
   fallback. See `/convex/api-reference` for the config options.

---

### 3. `/convex/quick-start` — Quick Start

**File:** `src/app/(docs)/convex/quick-start/page.mdx`

End-to-end example: create a `SslCommerzConvex` instance, register HTTP routes, and initiate a
payment session.

Sections:
1. **Create the component instance** — instantiate `SslCommerzConvex` in an `actions.ts` or
   `http.ts` file, passing the generated `components.sslcommerz` reference.
   ```ts
   import { components } from "./_generated/api";
   import { SslCommerzConvex } from "@better-sslcommerz/convex";

   export const sslcommerz = new SslCommerzConvex(components.sslcommerz);
   ```

2. **Register HTTP routes** — call `sslcommerz.registerRoutes(http)` in `http.ts`.
   ```ts
   import { httpRouter } from "convex/server";
   import { sslcommerz } from "./lib";

   const http = httpRouter();
   sslcommerz.registerRoutes(http);
   export default http;
   ```
   Registers four routes: `POST /sslcommerz/ipn`, `/sslcommerz/success`, `/sslcommerz/fail`,
   `/sslcommerz/cancel`. Add the IPN URL to your SSLCommerz store settings.

3. **Initiate a payment session** — call `sslcommerz.createPaymentSession` inside a Convex action.
   Show a minimal example with required fields (`tranId`, `totalAmount`, `currency`, customer info,
   product info, and the four callback URLs pointing at the registered routes).

4. **Read the result** — show `createPaymentSessionResult.gatewayUrl` and how to redirect the user
   to it.

Link forward to `/convex/http-routes` for customising the route callbacks and redirect URLs.

---

### 4. `/convex/http-routes` — HTTP Routes

**File:** `src/app/(docs)/convex/http-routes/page.mdx`

What to cover:

**Default paths table:**

| Route | Method | Purpose |
|-------|--------|---------|
| `/sslcommerz/ipn` | POST | SSLCommerz IPN webhook |
| `/sslcommerz/success` | POST | Gateway success redirect |
| `/sslcommerz/fail` | POST | Gateway failure redirect |
| `/sslcommerz/cancel` | POST | Gateway cancel redirect |

**Customising paths and redirect URLs** — show `RegisterRoutesConfig`:
```ts
sslcommerz.registerRoutes(http, {
  ipnPath: "/payments/ipn",
  successPath: "/payments/success",
  failPath: "/payments/fail",
  cancelPath: "/payments/cancel",
  successRedirectUrl: "/dashboard/orders",
  failRedirectUrl: "/checkout?error=payment_failed",
  cancelRedirectUrl: "/checkout",
});
```

**Callbacks** — the four async callbacks (`onIpn`, `onSuccess`, `onFail`, `onCancel`) run after
the route has persisted the event. Use them for business logic (send email, update order status,
etc.). Show an `onIpn` example that reads the validated IPN and runs a mutation.

**IPN verification flow** — describe what the IPN handler does automatically:
1. Parses and validates the payload shape.
2. Records the event as unverified.
3. Calls `validateOrder` to verify with SSLCommerz.
4. Marks the event as verified on success.
5. Runs `onIpn` with the verified data.

**Success redirect flow** — describe what the success handler does:
1. Reads `tran_id` / `val_id` from the form body.
2. Sets the session status to `"success"`.
3. Calls `validateOrder` to confirm.
4. Runs `onSuccess`.
5. Redirects to `successRedirectUrl`.

Note: the standalone `registerRoutes(http, component, config?, componentConfig?)` export is
available for apps that do not use the class.

---

### 5. `/convex/reading-data` — Reading Data

**File:** `src/app/(docs)/convex/reading-data/page.mdx`

Show how to call the built-in query helpers from Convex queries, mutations, and actions using
`ctx.runQuery`.

Sections per entity:

**Payment Sessions**
- `getPaymentSession(ctx, { tranId })`
- `getPaymentSessionBySessionKey(ctx, { sessionKey })`
- `listPaymentSessionsByStatus(ctx, { status })` — status values: `pending`, `success`, `failed`,
  `cancelled`, `expired`
- `listPaymentSessionsByUserId(ctx, { userId })`
- `listPaymentSessionsByOrgId(ctx, { orgId })`

**Transactions**
- `getTransactionByTranId(ctx, { tranId })`
- `getTransactionByValId(ctx, { valId })`
- `listTransactionsByStatus(ctx, { status })`

**Refunds**
- `getRefundByRefId(ctx, { refundRefId })`
- `listRefundsByStatus(ctx, { status })`

**Invoices**
- `getInvoiceById(ctx, { invoiceId })`
- `listInvoicesByPaymentStatus(ctx, { paymentStatus })`

**IPN Events**
- `listIpnEventsByTranId(ctx, { tranId })`
- `getIpnEventByValId(ctx, { valId })`

Show a code example for each group: calling the method inside a Convex query/action and using the
typed return value. Show the `RunQueryCtx` / `RunMutationCtx` / `RunActionCtx` context interfaces.

---

### 6. `/convex/database-schema` — Database Schema

**File:** `src/app/(docs)/convex/database-schema/page.mdx`

Document all five tables the component creates. For each table list: purpose, all fields with
types and whether optional, and the available indexes.

Tables:
1. `paymentSessions` — one record per `createPaymentSession` call; tracks lifecycle status.
2. `transactions` — one record per `validateOrder` call; the verified transaction detail.
3. `refunds` — one record per refund initiation or status check.
4. `invoices` — one record per invoice creation or status check.
5. `ipnEvents` — one record per IPN POST; includes a `verified` flag set after `validateOrder`.

Format: a field-reference table per table (same style as the Core API pages in the existing docs),
followed by the available index names that can be used in custom queries.

Note: all records omit Convex's `_id` and `_creationTime` fields from the component's return
values but they are queryable if you call the internal component queries directly.

---

### 7. `/convex/api-reference` — API Reference

**File:** `src/app/(docs)/convex/api-reference/page.mdx`

Full reference for everything exported from `@better-sslcommerz/convex`.

Sections:

**`SslCommerzConvex` class**
- Constructor: `new SslCommerzConvex(component, config?)`
  - `component` — the `ComponentApi` ref from `components.sslcommerz`
  - `config` — `SslCommerzComponentConfig`: `storeId`, `storePasswd`, `environment`,
    `validateResponse`. Falls back to `SSLCOMMERZ_*` env vars.

**Methods table** (one row per method):

| Method | Returns | Description |
|--------|---------|-------------|
| `createPaymentSession(ctx, args)` | `CreatePaymentSessionResult` | Calls the gateway, persists a session record |
| `validateOrder(ctx, args)` | gateway response | Verifies with SSLCommerz, upserts transaction + syncs session |
| `refundInitiate(ctx, args)` | gateway response | Initiates refund, persists refund record |
| `refundStatus(ctx, args)` | gateway response | Polls refund status, updates refund record |
| `transactionQueryBySession(ctx, args)` | gateway response | Queries by session, upserts transaction |
| `transactionQueryByTranId(ctx, args)` | gateway response | Queries by tran ID, upserts all found transactions |
| `createInvoice(ctx, args)` | gateway response | Creates invoice, persists invoice record |
| `invoiceStatus(ctx, args)` | gateway response | Checks invoice status, updates invoice record |
| `invoiceCancel(ctx, args)` | gateway response | Cancels invoice, updates invoice record |
| `registerRoutes(http, config?)` | `void` | Registers the 4 HTTP callback routes |
| `parseIpnPayload(payload)` | parsed IPN | Validates and parses a raw IPN payload |
| All `get*` / `list*` methods | typed record or array | See Reading Data |

**Standalone `registerRoutes` export**
```ts
import { registerRoutes } from "@better-sslcommerz/convex";
registerRoutes(http, components.sslcommerz, routesConfig?, componentConfig?);
```

**`RegisterRoutesConfig` type** — all path and redirect URL overrides plus the four callbacks.

**`SslCommerzComponentConfig` type** — `storeId?`, `storePasswd?`, `environment?`,
`validateResponse?`.

---

### 8. `/convex/testing` — Testing

**File:** `src/app/(docs)/convex/testing/page.mdx`

How to test code that uses the `@better-sslcommerz/convex` component with `convex-test`.

Steps:
1. Install `convex-test` as a dev dependency.
2. Import the `register` helper from `@better-sslcommerz/convex/test`.
3. Wire it into a `convex-test` `TestConvex` instance.
4. Write tests against `SslCommerzConvex` methods using the in-memory backend.

Show a minimal vitest example: set up the test convex instance, instantiate `SslCommerzConvex`
with the test component ref, call `createPaymentSession` (mocking the HTTP call), and assert the
resulting record was persisted.

Note: the `./test` export is not included in the main package bundle; import it explicitly from
`@better-sslcommerz/convex/test`.

---

## Pages Not Needed

- **Core API pages** (`/core/*`) — no changes; the Convex methods delegate to the same underlying
  SDK calls, so input/output shapes are already documented there.
- **Invoice API pages** (`/invoice/*`) — same reason.
- **Configuration** (`/configuration`) — covers the base SDK client only; Convex-specific config
  is documented in `/convex/api-reference`.
- **Types** (`/types`) — covers SDK types; Convex-specific types (`SslCommerzComponentConfig`,
  `RegisterRoutesConfig`, etc.) are documented inline in the API reference page.
- **Errors** (`/errors`) — the component surfaces the same `SslcommerzError` hierarchy from the
  base SDK; no new error types are introduced.

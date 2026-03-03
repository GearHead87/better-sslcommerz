# @better-sslcommerz/better-sslcommerz Plan

## Goals

- Build a typed, minimal-dependency SDK for SSLCommerz endpoints.
- Centralize request/response schemas in `@better-sslcommerz/validators` using Zod.
- Reuse schemas/types across packages, with strict runtime validation for inputs and optional validation for responses.
- Ship a stable API surface that can be extended to Quick Bank Pay and Google Pay later.

## API Scope (4 Categories)

1. General APIs
   - Create Session (Initiate Payment)
   - IPN payload validation (client-side parse + schema)
   - Order Validation
   - Refund Initiate / Refund Status / Transaction Query
2. Invoice APIs
   - Create Invoice
   - Invoice Payment Status
   - Invoice Cancellation
3. Bill Query APIs (Quick Bank Pay)
   - JWT Auth / Bill Query / Payment Confirm / Status
4. Google Pay APIs
   - Config / Initiate / Token Process

We will implement **General + Invoice** first since they share the same base URLs.

## Architecture Overview

- `@better-sslcommerz/validators`
  - Owns all Zod schemas and exported TypeScript types.
  - Exposes request/response schemas per endpoint.
  - Exposes shared primitives (money, currency, tran_id, date-time, etc.).
- `@better-sslcommerz/better-sslcommerz`
  - Lightweight HTTP client + endpoint wrappers.
  - Uses validators to parse and validate inputs (and optionally responses).
  - Environment config (sandbox vs live) and base URL resolver.
  - Exposes a single public client with namespaced methods.

### Proposed Package Structure (better-sslcommerz)

- `src/`
  - `index.ts` (public exports)
  - `client.ts` (create client, base config, http helper)
  - `endpoints/`
    - `general/` (session, validation, refund, transaction query)
    - `invoice/` (create, status, cancel)
    - `bill-query/` (future)
    - `google-pay/` (future)
  - `types.ts` (public types, re-exported from validators)
  - `errors.ts` (typed errors, optional response validation failure)

### Proposed Package Structure (validators)

- `src/`
  - `index.ts` (exports all schemas + types)
  - `general/`
    - `create-session.ts`
    - `validation.ts`
    - `refund.ts`
    - `transaction-query.ts`
    - `ipn.ts`
  - `invoice/`
    - `create-invoice.ts`
    - `invoice-status.ts`
    - `invoice-cancel.ts`
  - `bill-query/` (future)
  - `google-pay/` (future)
  - `shared/` (money, currency, ids, pagination, base response)

## Design Decisions

- **Single client**: `createSslcommerzClient({ storeId, storePasswd, environment })`.
- **Base URL resolution**: general + invoice use `sandbox.sslcommerz.com` or `securepay.sslcommerz.com`.
- **HTTP**: default to `fetch` with URL-encoded form for POST (per docs) and query params for GET.
- **Validation**:
  - Always validate inputs with Zod before sending.
  - Response validation is optional but available via `{ validateResponse: true }`.
- **Type exports**:
  - From validators: `type CreateSessionInput`, `CreateSessionResponse`, etc.
  - Re-export in better-sslcommerz for convenience.
- **Future-proofing**: maintain endpoint namespaces so new categories can be added without breaking.

## Implementation Plan

### Phase 1: Validators Foundation

1. Create shared primitives in `validators/src/shared/`.
2. Add General API schemas:
   - Create Session request/response
   - IPN payload schema
   - Order Validation request/response
   - Refund Initiate + Refund Status request/response
   - Transaction Query (by session + by tran_id) response
3. Add Invoice API schemas:
   - Create Invoice request/response
   - Invoice Payment Status request/response
   - Invoice Cancellation request/response
4. Export all Zod schemas + types from `validators/src/index.ts`.

### Phase 2: SDK Client + Endpoints (General + Invoice)

1. Implement `client.ts`:
   - config, base URL resolver, request helper
   - strict input validation using validators
2. Implement General endpoints wrappers:
   - `createSession`, `validateOrder`, `refundInitiate`, `refundStatus`, `transactionQueryBySession`, `transactionQueryByTranId`
3. Implement Invoice endpoints wrappers:
   - `createInvoice`, `invoiceStatus`, `invoiceCancel`
4. Re-export types from validators in `src/types.ts` and `src/index.ts`.

### Phase 3: Documentation + Examples

1. Add README usage examples for General + Invoice.
2. Add environment configuration guidance.
3. Add simple error-handling examples.

### Phase 4: Future Additions

1. Bill Query APIs (Quick Bank Pay) via separate namespace.
2. Google Pay APIs via separate namespace.
3. Optional response signature verification helpers.

## Public API Sketch

```ts
import { createSslcommerzClient } from "@better-sslcommerz/better-sslcommerz";

const sslcz = createSslcommerzClient({
  storeId: "",
  storePasswd: "",
  environment: "sandbox",
  validateResponse: false,
});

const session = await sslcz.general.createSession({
  total_amount: 1000,
  currency: "BDT",
  tran_id: "T-123",
  success_url: "https://example.com/success",
  fail_url: "https://example.com/fail",
  cancel_url: "https://example.com/cancel",
  product_category: "general",
  product_name: "Demo",
  product_profile: "general",
  cus_name: "Customer",
  cus_email: "customer@example.com",
  cus_add1: "Dhaka",
  cus_city: "Dhaka",
  cus_postcode: "1200",
  cus_country: "BD",
  cus_phone: "01700000000",
  shipping_method: "NO",
  num_of_item: 1,
});
```

## Deliverables

- `package-plan.md` (this plan)
- Validators with Zod schemas and exported types
- SDK client for General + Invoice APIs
- README with examples

# Better SSLCommerz Docs — Site Plan

> Based on a full read of `packages/better-sslcommerz/src/`, `packages/validators/src/`, and `ssl.md`.

---

## Overview

The docs site (`apps/docs`) is a Next.js + MDX app. The current `(docs)` route group has only two stubs:
`/` (Introduction) and `/getting-started`. The plan below replaces all existing pages and adds
a complete set that maps 1-to-1 with the actual package API surface.

---

## Site Structure

```
/                               Introduction
/getting-started                Installation & First Setup
/configuration                  Client options reference

/core/create-session            Initiate a payment session
/core/ipn                       Handle IPN webhooks
/core/validate-order            Validate an order after IPN
/core/refund                    Initiate & query refunds
/core/transaction-query         Query transactions

/invoice/create-invoice         Create a payment invoice
/invoice/invoice-status         Check invoice payment status
/invoice/invoice-cancel         Cancel an invoice

/errors                         Error types & handling
/types                          TypeScript type reference
```

Total: **13 pages** across 4 sections.

---

## Navigation Groups (site-config.ts)

```
Getting Started
  - Introduction               /
  - Installation               /getting-started
  - Configuration              /configuration

Core API
  - Create Session             /core/create-session
  - IPN Webhooks               /core/ipn
  - Validate Order             /core/validate-order
  - Refunds                    /core/refund
  - Transaction Query          /core/transaction-query

Invoice API
  - Create Invoice             /invoice/create-invoice
  - Invoice Status             /invoice/invoice-status
  - Cancel Invoice             /invoice/invoice-cancel

Reference
  - Error Handling             /errors
  - TypeScript Types           /types
```

---

## Page-by-Page Content Plan

---

### 1. `/` — Introduction

**Summary:**  
High-level overview of `better-sslcommerz`. What the package is, what problems it solves,
and what makes it different from raw API calls.

**Content:**

- What is SSLCommerz (1 sentence context)
- What `better-sslcommerz` provides:
  - Type-safe client built with TypeScript
  - Zod-validated request/response schemas (via `@better-sslcommerz/validators`)
  - First-class support for both sandbox and live environments
  - Two API namespaces: `client.core` and `client.invoice`
  - Built-in IPN payload parser (`core.parseIpnPayload`)
  - Three error classes: `SslcommerzError`, `SslcommerzHttpError`, `SslcommerzValidationError`
- Package name: `better-sslcommerz`
- Quick navigation cards to Getting Started and Core API

---

### 2. `/getting-started` — Installation & First Setup

**Summary:**  
End-to-end minimal working example: install, create client, call `createSession`, redirect.

**Content:**

- Install: `npm install better-sslcommerz` / `pnpm add better-sslcommerz`
- Environment variables: `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWD`
- Create client (sandbox vs live):
  ```ts
  import { createSslcommerzClient } from "better-sslcommerz";

  const client = createSslcommerzClient({
    storeId: process.env.SSLCOMMERZ_STORE_ID!,
    storePasswd: process.env.SSLCOMMERZ_STORE_PASSWD!,
    environment: "sandbox", // or "live"
  });
  ```
- Minimal `createSession` call with required fields
- Redirect user to `response.GatewayPageURL`
- Sandbox test card credentials (from ssl.md):
  - VISA: 4111111111111111, CVV 111, Exp 12/26
  - Mastercard: 5111111111111111, CVV 111, Exp 12/26
  - Mobile OTP: 111111 or 123456
- Next steps: configure IPN, validate orders

---

### 3. `/configuration` — Client Options Reference

**Summary:**  
Full reference for `CreateSslcommerzClientOptions`.

**Content:**

- Options table:

| Option             | Type                  | Default      | Description                                     |
| ------------------ | --------------------- | ------------ | ----------------------------------------------- |
| `storeId`          | `string`              | required     | SSLCommerz store ID                             |
| `storePasswd`      | `string`              | required     | SSLCommerz store password                       |
| `environment`      | `"sandbox" \| "live"` | `"sandbox"`  | Which base URL to target                        |
| `validateResponse` | `boolean`             | `false`      | Run Zod parse on responses (throws on mismatch) |
| `baseUrl`          | `string`              | auto         | Override base URL (overrides `environment`)     |
| `fetch`            | `typeof fetch`        | global fetch | Custom fetch implementation (e.g. undici)       |
| `timeoutMs`        | `number`              | `30000`      | Request timeout in milliseconds                 |

- Environments table (sandbox vs live URLs)
- Per-request `options?: SslcommerzRequestOptions`:
  - `signal?: AbortSignal` — cancellation
  - `validateResponse?: boolean` — per-request override
- TLS requirement note (TLS 1.2+)

---

### 4. `/core/create-session` — Initiate a Payment Session

**Summary:**  
How to call `client.core.createSession()`, what input fields are required/conditional,
and what to do with the response.

**Content:**

- Method signature: `core.createSession(input: CreateSessionInput, options?) → Promise<CreateSessionResponse>`
- Underlying endpoint: `POST gwprocess/v4/api.php`
- `store_id` / `store_passwd` auto-injected — do not include them in `input`
- Required fields summary:
  - `total_amount`, `currency`, `tran_id` (must be unique)
  - `success_url`, `fail_url`, `cancel_url`, `ipn_url` (recommended)
  - `product_category`, `product_name`, `product_profile`
  - Customer info: `cus_name`, `cus_email`, `cus_add1`, `cus_city`, `cus_postcode`, `cus_country`, `cus_phone`
  - `shipping_method` (YES / NO / Courier / SSLCOMMERZ_LOGISTIC)
- Conditional fields explained:
  - When `shipping_method = "YES"`: `ship_name`, `ship_add1`, `ship_area`, `ship_city`, `ship_sub_city`, `ship_postcode`, `ship_country`
  - When `shipping_method = "SSLCOMMERZ_LOGISTIC"`: above + `num_of_item`, `weight_of_items`, `logistic_pickup_id`, `logistic_delivery_type`
  - When `product_profile = "airline-tickets"`: `hours_till_departure`, `flight_type`, `pnr`, `journey_from_to`, `third_party_booking`
  - When `product_profile = "travel-vertical"`: `hotel_name`, `length_of_stay`, `check_in_time`, `hotel_city`
  - When `product_profile = "telecom-vertical"`: `product_type`, `topup_number`, `country_topup`
  - When `emi_option = 1`: `emi_max_inst_option` required
- Optional fields: `multi_card_name`, `allowed_bin`, EMI options, `cart`, pricing breakdown, `value_a–d`
- Full code example (physical-goods, shipping NO)
- Response: use `GatewayPageURL` to redirect user
- Response fields table: `status`, `GatewayPageURL`, `sessionkey`, `failedreason`, etc.
- Product profile values table (from ssl.md §4)

---

### 5. `/core/ipn` — Handle IPN Webhooks

**Summary:**  
How SSLCommerz posts to your IPN URL, and how to parse + validate the payload with `parseIpnPayload`.

**Content:**

- What IPN is: SSLCommerz → merchant POST after payment attempt
- Configure IPN URL in Merchant Panel or pass `ipn_url` in `createSession`
- Firewall/IP requirements — SSLCommerz inbound IPs:
  - Sandbox: 103.26.139.81, 103.132.153.81 (TCP 80/443)
  - Live: 103.26.139.87 (TCP 80/443)
- `parseIpnPayload(payload: unknown): IpnPayload`
  - Throws `SslcommerzValidationError` on invalid shape
  - Use in a POST route handler (Next.js App Router example)
- IPN payload fields table: `status`, `tran_id`, `val_id`, `amount`, `store_amount`, `card_type`, `bank_tran_id`, `verify_sign`, `verify_key`, `risk_level`, etc.
- Status values: VALID, FAILED, CANCELLED, EXPIRED, UNATTEMPTED
- Security notes:
  - Always call `validateOrder` with `val_id` after receiving IPN — do NOT update DB from IPN alone
  - If `risk_level = 1` and `status = "VALID"` — hold service, verify customer

---

### 6. `/core/validate-order` — Validate an Order

**Summary:**  
How to call `client.core.validateOrder()` to confirm a payment after IPN or redirect.

**Content:**

- Method signature: `core.validateOrder(input: ValidateOrderInput, options?) → Promise<OrderValidationResponse>`
- Underlying endpoint: `GET validator/api/validationserverAPI.php`
- Input: `{ val_id: string }` (store_id/store_passwd auto-injected)
- Code example: validate after IPN POST, then update order in DB
- Response fields: `status`, `tran_id`, `val_id`, `amount`, `store_amount`, `currency`, `card_type`, EMI fields, discount fields, `risk_level`, `validated_on`, etc.
- Security checklist:
  - Check `status` is `VALID` or `VALIDATED`
  - Cross-check `amount` and `currency` against your own DB record
  - Cross-check `tran_id` matches your stored transaction
  - If `risk_level = 1`, hold fulfillment

---

### 7. `/core/refund` — Initiate & Query Refunds

**Summary:**  
How to initiate a refund and then check its status.

**Content:**

- **Initiate Refund**
  - Method: `core.refundInitiate(input: RefundInitiateInput, options?) → Promise<RefundInitiateResponse>`
  - Endpoint: `GET validator/api/merchantTransIDvalidationAPI.php`
  - Input fields: `bank_tran_id`, `refund_trans_id` (unique, new required field from Feb 2025), `refund_amount`, `refund_remarks`, `refe_id` (optional)
  - Response: `APIConnect`, `refund_ref_id`, `status`, `errorReason`
  - Security note: public IP must be whitelisted in SSLCommerz Live System
- **Query Refund Status**
  - Method: `core.refundStatus(input: RefundStatusInput, options?) → Promise<RefundStatusResponse>`
  - Input: `{ refund_ref_id: string }`
  - Response: `status` (refunded / processing / cancelled), `initiated_on`, `refunded_on`
- Code example (initiate then poll status)

---

### 8. `/core/transaction-query` — Query Transactions

**Summary:**  
Two ways to look up transaction details: by session key or by transaction ID.

**Content:**

- **By Session Key**
  - Method: `core.transactionQueryBySession(input, options?) → Promise<TransactionQueryBySessionResponse>`
  - Input: `{ sessionkey: string }`
  - Response: full transaction object (status, tran_id, val_id, amount, card details, EMI, etc.)
- **By Transaction ID**
  - Method: `core.transactionQueryByTranId(input, options?) → Promise<TransactionQueryByTranIdResponse>`
  - Input: `{ tran_id: string }`
  - Response: `{ no_of_trans_found, element: TransactionBase[] }` — array because same tran_id can have multiple attempts
- Transaction status values table: VALID, VALIDATED, FAILED, CANCELLED, EXPIRED, UNATTEMPTED, PENDING
- Code examples for both methods

---

### 9. `/invoice/create-invoice` — Create a Payment Invoice

**Summary:**  
How to create a shareable payment link (invoice) with optional QR code and email/SMS delivery.

**Content:**

- Method: `invoice.createInvoice(input: CreateInvoiceInput, options?) → Promise<CreateInvoiceResponse>`
- Endpoint: `POST gwprocess/v4/invoice.php`
- Differs from `createSession`: requires `refer` (panel reference code), `acct_no` (invoice reference)
- Key extra fields: `is_bangla_qr_enabled`, `is_sent_email`, `is_sent_sms`
- Shipping: `SSLCOMMERZ_LOGISTIC` not supported here (only YES / NO / Courier)
- Conditional validation same as `createSession` (shipping, product profile, EMI)
- Response: `pay_url` (share with customer), `qr_image_url`, `invoice_id`, `email_sending_status`, `sms_sending_status`
- Full code example

---

### 10. `/invoice/invoice-status` — Invoice Payment Status

**Summary:**  
Check whether an invoice has been paid.

**Content:**

- Method: `invoice.invoiceStatus(input: InvoiceStatusInput, options?) → Promise<InvoiceStatusResponse>`
- Endpoint: `POST validator/api/v4/` with `action: "invoicePaymentStatus"` (auto-injected)
- Input: `{ refer: string, invoice_id: string }`
- Response: `payment_status` (VALID / PENDING / FAILED / VALIDATED), `transaction` array
- Code example: poll after sending invoice

---

### 11. `/invoice/invoice-cancel` — Cancel an Invoice

**Summary:**  
Cancel a pending invoice before payment.

**Content:**

- Method: `invoice.invoiceCancel(input: InvoiceCancelInput, options?) → Promise<InvoiceCancelResponse>`
- Endpoint: `POST validator/api/v4/` with `action: "invoiceCancellation"` (auto-injected)
- Input: `{ refer: string, invoice_id: string }`
- Response: `payment_status` (CANCELLED / VALID), `failedreason`
- Note: cannot cancel already-paid invoices

---

### 12. `/errors` — Error Handling

**Summary:**  
The three error classes, when each is thrown, and how to catch them.

**Content:**

- Error hierarchy diagram:
  ```
  SslcommerzError (base)
  ├── SslcommerzHttpError      — non-2xx HTTP response
  └── SslcommerzValidationError — Zod schema parse failure
  ```
- **`SslcommerzError`**
  - Base class for all package errors
  - Properties: `message`, `code` (`"SSL_COMMERZ_ERROR"`), `cause`
- **`SslcommerzHttpError`**
  - Thrown when the HTTP response is not `2xx`
  - Properties: `endpoint`, `status` (HTTP code), `statusText`, `responseBody`
  - Code: `"SSL_COMMERZ_HTTP_ERROR"`
- **`SslcommerzValidationError`**
  - Thrown when Zod schema parse fails (always on request, optionally on response when `validateResponse: true`)
  - Properties: `stage` ("request" | "response"), `endpoint`, `issues` (Zod issue array)
  - Code: `"SSL_COMMERZ_VALIDATION_ERROR"`
- `validateResponse` option — default `false`; enable to also validate responses against schema
- Code example: full try/catch with `instanceof` narrowing
- Note on `parseIpnPayload` — always validates, always throws `SslcommerzValidationError`

---

### 13. `/types` — TypeScript Type Reference

**Summary:**  
All exported types, where they come from, and how to import them.

**Content:**

- All types are re-exported from `better-sslcommerz` (originally from `@better-sslcommerz/validators`)
- Input types (omit `store_id`/`store_passwd` — injected by client):
  - `CreateSessionInput`
  - `ValidateOrderInput`
  - `RefundInitiateInput`
  - `RefundStatusInput`
  - `TransactionQueryBySessionInput`
  - `TransactionQueryByTranIdInput`
  - `CreateInvoiceInput`
  - `InvoiceStatusInput`
  - `InvoiceCancelInput`
- Request types (full, including auth — for validators package direct use):
  - `CreateSessionRequest`, `OrderValidationRequest`, `RefundInitiateRequest`, etc.
- Response types:
  - `CreateSessionResponse`, `OrderValidationResponse`, `RefundInitiateResponse`, `RefundStatusResponse`
  - `TransactionQueryBySessionResponse`, `TransactionQueryByTranIdResponse`
  - `CreateInvoiceResponse`, `InvoiceStatusResponse`, `InvoiceCancelResponse`
  - `IpnPayload`
- Utility types:
  - `SslcommerzEnvironment` — `"sandbox" | "live"`
  - `SslcommerzClient` — the returned client object
  - `SslcommerzCoreApi` — shape of `client.core`
  - `SslcommerzInvoiceApi` — shape of `client.invoice`
  - `SslcommerzRequestOptions` — `{ signal?, validateResponse? }`
  - `FetchLike` — `typeof fetch`
- Zod schemas (also exported, for custom validation):
  - `createSessionRequestSchema`, `ipnPayloadSchema`, `refundInitiateRequestSchema`, etc.
- Import example:
  ```ts
  import type {
    CreateSessionInput,
    CreateSessionResponse,
    IpnPayload,
    SslcommerzClient,
  } from "better-sslcommerz";
  ```

---

## Notes for Implementation

- All pages use `.mdx` under `apps/docs/src/app/(docs)/`
- Pages in subdirectories: `core/create-session/page.mdx`, `invoice/create-invoice/page.mdx`, etc.
- `site-config.ts` needs to be updated with all new nav groups and links
- Existing pages (`/` and `/getting-started`) are replaced/rewritten — not extended
- Code examples should use `better-sslcommerz` (the public package name, not workspace alias)
- All examples assume Next.js App Router (server components / route handlers)

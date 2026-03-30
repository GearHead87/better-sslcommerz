# @better-sslcommerz/sdk

`@better-sslcommerz/sdk` is a production-ready TypeScript SDK for the SSLCommerz v4 gateway.
It gives you typed methods, schema-backed validation, and consistent error handling for payments, order validation, refunds, transaction queries, and invoices.

## Why use this package

- Full SSLCommerz API coverage for core and invoice flows
- Strong TypeScript types for request and response payloads
- Built-in request validation with optional response validation
- IPN payload parsing support via `parseIpnPayload()`
- Structured errors with `SslcommerzError`, `SslcommerzHttpError`, and `SslcommerzValidationError`

## Install

```bash
npm install @better-sslcommerz/sdk
# or
pnpm add @better-sslcommerz/sdk
# or
yarn add @better-sslcommerz/sdk
```

## Basic setup

### 1) Add environment variables

```bash
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWD=your_store_password
```

Keep `SSLCOMMERZ_STORE_PASSWD` server-side only.

### 2) Create a reusable client

```ts
import { createSslcommerzClient } from "@better-sslcommerz/sdk";

export const sslcommerz = createSslcommerzClient({
  storeId: process.env.SSLCOMMERZ_STORE_ID!,
  storePasswd: process.env.SSLCOMMERZ_STORE_PASSWD!,
  environment: "sandbox", // switch to "live" in production
  // validateResponse: true, // optional, useful in development
});
```

### 3) Create a payment session

```ts
const session = await sslcommerz.core.createSession({
  total_amount: 500,
  currency: "BDT",
  tran_id: `TXN_${Date.now()}`,
  success_url: "https://yoursite.com/payment/success",
  fail_url: "https://yoursite.com/payment/fail",
  cancel_url: "https://yoursite.com/payment/cancel",
  ipn_url: "https://yoursite.com/api/ipn",
  product_name: "Premium Subscription",
  product_category: "subscription",
  product_profile: "non-physical-goods",
  cus_name: "Jane Doe",
  cus_email: "jane@example.com",
  cus_add1: "123 Main Street",
  cus_city: "Dhaka",
  cus_postcode: "1207",
  cus_country: "Bangladesh",
  cus_phone: "01700000000",
  shipping_method: "NO",
  num_of_item: 1,
});

if (session.status === "SUCCESS" && session.GatewayPageURL) {
  // Redirect your customer to this URL
  console.log(session.GatewayPageURL);
}
```

### 4) Validate payment before fulfilling orders

```ts
const validation = await sslcommerz.core.validateOrder({ val_id: "..." });

if (validation.status === "VALID" || validation.status === "VALIDATED") {
  // Cross-check tran_id, amount, and currency against your own database
  // then mark order as paid
}
```

Always validate using `validateOrder` from IPN and/or success callback data before updating your database.

## Notes

- `sandbox` base URL: `https://sandbox.sslcommerz.com`
- `live` base URL: `https://securepay.sslcommerz.com`
- TLS 1.2+ is required by SSLCommerz

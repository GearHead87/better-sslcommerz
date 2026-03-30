# @better-sslcommerz/convex

`@better-sslcommerz/convex` is a Convex component for SSLCommerz integrations.
It wraps `@better-sslcommerz/sdk`, adds Convex-first APIs, persists payment data to Convex tables, and registers SSLCommerz callback HTTP routes.

## What this package provides

- `SslCommerzConvex` class for payment, refund, transaction, and invoice workflows
- Automatic persistence for sessions, transactions, refunds, invoices, and IPN events
- One-call HTTP route registration for IPN, success, fail, and cancel callbacks
- Query helpers to read stored records from Convex functions
- `@better-sslcommerz/convex/test` helper for `convex-test`

## Install

```bash
npm install @better-sslcommerz/convex
# or
pnpm add @better-sslcommerz/convex
# or
yarn add @better-sslcommerz/convex
```

This package requires `convex` as a peer dependency (`^1.31.6`).

## Basic setup

### 1) Register the component in `convex.config.ts`

```ts
import { defineApp } from "convex/server";

import sslcommerz from "@better-sslcommerz/convex/convex.config";

const app = defineApp();
app.use(sslcommerz);

export default app;
```

### 2) Run Convex codegen

```bash
npx convex dev
```

This generates `components.sslcommerz` in `convex/_generated/api`.

### 3) Set environment variables

```bash
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWD=your_store_password
SSLCOMMERZ_ENVIRONMENT=sandbox
```

`SSLCOMMERZ_STORE_PASSWD` must remain server-side.

### 4) Create a shared component instance

```ts
// convex/lib/sslcommerz.ts
import { SslCommerzConvex } from "@better-sslcommerz/convex";

import { components } from "../_generated/api";

export const sslcommerz = new SslCommerzConvex(components.sslcommerz);
```

### 5) Register callback routes

```ts
// convex/http.ts
import { httpRouter } from "convex/server";

import { sslcommerz } from "./lib/sslcommerz";

const http = httpRouter();
sslcommerz.registerRoutes(http);

export default http;
```

Default registered routes:

- `POST /sslcommerz/ipn`
- `POST /sslcommerz/success`
- `POST /sslcommerz/fail`
- `POST /sslcommerz/cancel`

### 6) Create a payment session in an action

```ts
import { action, v } from "convex/server";

import { sslcommerz } from "./lib/sslcommerz";

export const initiatePayment = action({
  args: {
    tranId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const result = await sslcommerz.createPaymentSession(ctx, {
      tranId: args.tranId,
      totalAmount: args.amount,
      currency: "BDT",
      successUrl: "https://yourapp.com/payment/success",
      failUrl: "https://yourapp.com/payment/fail",
      cancelUrl: "https://yourapp.com/payment/cancel",
      ipnUrl: "https://<your-deployment>.convex.site/sslcommerz/ipn",
      customerInfo: {
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "01700000000",
        address1: "123 Main Street",
        city: "Dhaka",
        postcode: "1207",
        country: "Bangladesh",
      },
      productInfo: {
        name: "Premium Subscription",
        category: "general",
        profile: "general",
      },
    });

    return result.gatewayUrl;
  },
});
```

Redirect your frontend user to the returned `gatewayUrl` to complete payment.

## Testing support

Use the `@better-sslcommerz/convex/test` entrypoint to register the component in `convex-test`:

```ts
import { register } from "@better-sslcommerz/convex/test";

register(t);
```

## Development

```bash
pnpm --filter @better-sslcommerz/convex build:codegen
pnpm --filter @better-sslcommerz/convex typecheck
pnpm --filter @better-sslcommerz/convex lint
pnpm --filter @better-sslcommerz/convex test
```

Notes:

- `build:codegen` expects `CONVEX_DEPLOYMENT` to be available.
- Keep `convex.config.js` at the package root for component codegen.

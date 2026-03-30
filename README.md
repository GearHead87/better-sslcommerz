# @better-sslcommerz/sdk

<p align="center">
  <a href="https://www.npmjs.com/package/@better-sslcommerz/sdk"><img alt="npm" src="https://img.shields.io/npm/v/%40better-sslcommerz%2Fsdk?style=flat-square" /></a>
  <a href="https://github.com/GearHead87/better-sslcommerz/actions/workflows/ci.yml"><img alt="CI status" src="https://img.shields.io/github/actions/workflow/status/GearHead87/better-sslcommerz/ci.yml?style=flat-square&branch=main&label=ci" /></a>
</p>

<!-- <p align="center">
  <a href="https://opencode.ai">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="OpenCode logo">
    </picture>
  </a>
</p> -->

<p align="center"><strong>Production-ready TypeScript SDK for SSLCommerz payments, refunds, transaction queries, and invoices.</strong></p>

`@better-sslcommerz/sdk` provides a clean typed client for SSLCommerz v4 APIs with built-in request validation, optional response validation, and structured error handling.

## Install

```bash
npm install @better-sslcommerz/sdk
```

## Quick start

```ts
import { createSslcommerzClient } from "@better-sslcommerz/sdk";

const client = createSslcommerzClient({
  storeId: process.env.SSLCOMMERZ_STORE_ID!,
  storePasswd: process.env.SSLCOMMERZ_STORE_PASSWD!,
  environment: "sandbox", // "live" for production
});

const session = await client.core.createSession({
  total_amount: 100,
  currency: "BDT",
  tran_id: `TXN_${Date.now()}`,
  success_url: "https://example.com/success",
  fail_url: "https://example.com/fail",
  cancel_url: "https://example.com/cancel",
  ipn_url: "https://example.com/api/ipn",
  product_name: "Demo Product",
  product_category: "general",
  product_profile: "general",
  cus_name: "Demo User",
  cus_email: "demo@example.com",
  cus_add1: "Dhaka",
  cus_city: "Dhaka",
  cus_postcode: "1207",
  cus_country: "Bangladesh",
  cus_phone: "01700000000",
  shipping_method: "NO",
  num_of_item: 1,
});

console.log(session.GatewayPageURL);
```

## What you get

- Typed API methods for core and invoice flows.
- Zod schemas from `@better-sslcommerz/validators`.
- `parseIpnPayload()` helper for IPN webhook validation.
- Configurable timeout, custom `fetch`, and per-request abort support.
- Structured errors: `SslcommerzError`, `SslcommerzHttpError`, `SslcommerzValidationError`.

## Packages in this monorepo

- `packages/better-sslcommerz` - main published SDK package.
- `packages/validators` - shared Zod schemas and TypeScript models.
- `apps/docs` - documentation site with full API usage guides.

## Docs

For detailed usage and endpoint-by-endpoint examples, see `apps/docs`.

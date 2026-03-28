# with-nextjs-convex

This example demonstrates how to integrate `@better-sslcommerz/convex` in a
Next.js + Convex app.

The project was copied from `nutrition-tracker-web-app` and adapted to:

- install the SSLCommerz Convex component in `convex/convex.config.ts`
- register HTTP routes via `registerRoutes` in `convex/http.ts`
- implement a demo product storefront that creates live checkout sessions using
  Convex actions (`convex/sslcommerz.ts`)

## Prerequisites

- Node.js `^22.21.0`
- pnpm `^10.19.0`
- a Convex project/deployment
- SSLCommerz sandbox or live credentials

## Environment variables

Copy `.env.example` to `.env` and set values:

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`
- `APP_BASE_URL`
- `SSLCOMMERZ_ENVIRONMENT`
- `SSLCOMMERZ_STORE_ID`
- `SSLCOMMERZ_STORE_PASSWD`
- `SSLCOMMERZ_VALIDATE_RESPONSE`

`NEXT_PUBLIC_CONVEX_SITE_URL` is used for callback/IPN URLs.

## Install and run

From the monorepo root:

```bash
pnpm install
pnpm --filter with-nextjs-convex dev:backend
pnpm --filter with-nextjs-convex dev:frontend
```

Open `http://localhost:3000`.

## Key files

- `convex/convex.config.ts`: installs Better Auth + SSLCommerz component
- `convex/http.ts`: registers auth routes and SSLCommerz IPN/success/fail/cancel
  handlers
- `convex/sslcommerz.ts`: demo products, checkout session creation, and recent
  session queries
- `src/components/sslcommerz/CheckoutDemo.tsx`: frontend storefront UI

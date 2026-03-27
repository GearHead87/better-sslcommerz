# @better-sslcommerz/convex

Convex component package for SSLCommerz integrations.

This package is under active development.

## Development

```bash
pnpm --filter @better-sslcommerz/convex build:codegen
pnpm --filter @better-sslcommerz/convex typecheck
pnpm --filter @better-sslcommerz/convex lint
pnpm --filter @better-sslcommerz/convex test
```

Notes:

- `build:codegen` expects `CONVEX_DEPLOYMENT` to be available (for local dev this is typically loaded from `.env.local`).
- Keep `convex.config.js` at package root; Convex codegen uses it when bundling component definitions.

import { SslCommerzConvex } from "@better-sslcommerz/convex";
import type { ComponentApi as SslCommerzComponentApi } from "@better-sslcommerz/convex/_generated/component.js";
import { v } from "convex/values";

import { components } from "./_generated/api";
import { action, query } from "./_generated/server";

const demoProductValidator = v.object({
  id: v.string(),
  name: v.string(),
  description: v.string(),
  category: v.string(),
  price: v.number(),
});

const paymentSessionStatus = v.union(
  v.literal("pending"),
  v.literal("success"),
  v.literal("failed"),
  v.literal("cancelled"),
  v.literal("expired"),
);

const recentSessionValidator = v.object({
  tranId: v.string(),
  sessionKey: v.string(),
  gatewayUrl: v.string(),
  status: paymentSessionStatus,
  amount: v.string(),
  currency: v.string(),
  environment: v.union(v.literal("sandbox"), v.literal("live")),
  createdAt: v.number(),
  updatedAt: v.number(),
  productId: v.optional(v.string()),
  productName: v.optional(v.string()),
});

const demoProducts = [
  {
    id: "starter-kit",
    name: "Starter Gateway Kit",
    description: "Quick start bundle for sandbox checkout flows.",
    category: "Developer Tools",
    price: 199,
  },
  {
    id: "secure-invoice",
    name: "Secure Invoice Pack",
    description: "Invoice templates for clean SSLCommerz handoff.",
    category: "Invoices",
    price: 349,
  },
  {
    id: "analytics-lite",
    name: "Analytics Lite",
    description: "Payment tracking widgets for your dashboard.",
    category: "Analytics",
    price: 499,
  },
  {
    id: "support-boost",
    name: "Support Boost",
    description: "Priority troubleshooting for gateway issues.",
    category: "Support",
    price: 259,
  },
  {
    id: "launch-bundle",
    name: "Launch Bundle",
    description: "Everything you need to ship a checkout experience.",
    category: "Bundles",
    price: 899,
  },
] as const;

const trimTrailingSlash = (value: string) =>
  value.endsWith("/") ? value.slice(0, -1) : value;

const parseBooleanEnv = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  return value.toLowerCase() === "true";
};

const getEnvironment = () => {
  const environment = process.env.SSLCOMMERZ_ENVIRONMENT;
  if (environment === "sandbox" || environment === "live") {
    return environment;
  }

  return undefined;
};

const getConvexSiteUrl = () => {
  const siteUrl =
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? process.env.CONVEX_SITE_URL;

  if (!siteUrl) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_SITE_URL (or CONVEX_SITE_URL) must be set for SSLCommerz callback routes.",
    );
  }

  return trimTrailingSlash(siteUrl);
};

const getMetadataValue = (metadata: unknown, key: string) => {
  if (typeof metadata !== "object" || metadata === null) {
    return undefined;
  }

  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
};

const generateTranId = () =>
  `DEMO-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const sslcommerzComponent = (components as unknown as {
  sslcommerz: SslCommerzComponentApi;
}).sslcommerz;

const createSslCommerz = () =>
  new SslCommerzConvex(sslcommerzComponent, {
    environment: getEnvironment(),
    validateResponse: parseBooleanEnv(process.env.SSLCOMMERZ_VALIDATE_RESPONSE),
  });

export const listDemoProducts = query({
  args: {},
  returns: v.array(demoProductValidator),
  handler: async () => {
    return demoProducts.map((product) => ({ ...product }));
  },
});

export const createCheckoutSession = action({
  args: {
    productId: v.string(),
  },
  returns: v.object({
    tranId: v.string(),
    sessionKey: v.string(),
    gatewayUrl: v.string(),
  }),
  handler: async (ctx, args) => {
    const product = demoProducts.find((item) => item.id === args.productId);
    if (!product) {
      throw new Error("Unknown product selected.");
    }

    const convexSiteUrl = getConvexSiteUrl();
    const tranId = generateTranId();

    const sslcommerz = createSslCommerz();

    return await sslcommerz.createPaymentSession(ctx, {
      tranId,
      totalAmount: product.price.toFixed(2),
      currency: "BDT",
      successUrl: `${convexSiteUrl}/sslcommerz/success`,
      failUrl: `${convexSiteUrl}/sslcommerz/fail`,
      cancelUrl: `${convexSiteUrl}/sslcommerz/cancel`,
      ipnUrl: `${convexSiteUrl}/sslcommerz/ipn`,
      customerInfo: {
        name: "Demo Customer",
        email: "demo.customer@example.com",
        address1: "House 12, Road 3",
        city: "Dhaka",
        postcode: "1207",
        country: "Bangladesh",
        phone: "01700000000",
      },
      productInfo: {
        name: product.name,
        category: product.category,
        profile: "general",
      },
      valueA: product.id,
      metadata: {
        productId: product.id,
        productName: product.name,
        productCategory: product.category,
      },
    });
  },
});

export const listRecentSessions = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(recentSessionValidator),
  handler: async (ctx, args) => {
    const sslcommerz = createSslCommerz();

    const statuses = [
      "pending",
      "success",
      "failed",
      "cancelled",
      "expired",
    ] as const;

    const sessionsByStatus = await Promise.all(
      statuses.map((status) =>
        sslcommerz.listPaymentSessionsByStatus(ctx, {
          status,
        }),
      ),
    );

    const merged = sessionsByStatus
      .flat()
      .sort((left, right) => right.updatedAt - left.updatedAt);

    const limit = Math.max(1, Math.min(args.limit ?? 12, 50));

    return merged.slice(0, limit).map((session) => ({
      tranId: session.tranId,
      sessionKey: session.sessionKey,
      gatewayUrl: session.gatewayUrl,
      status: session.status,
      amount: session.amount,
      currency: session.currency,
      environment: session.environment,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      productId: getMetadataValue(session.metadata, "productId"),
      productName: getMetadataValue(session.metadata, "productName"),
    }));
  },
});

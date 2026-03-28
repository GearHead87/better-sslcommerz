import { httpRouter } from "convex/server";
import { registerRoutes as registerSslCommerzRoutes } from "@better-sslcommerz/convex";
import type { ComponentApi as SslCommerzComponentApi } from "@better-sslcommerz/convex/_generated/component.js";

import { components } from "./_generated/api";
import { authComponent, createAuth } from "./auth";

const trimTrailingSlash = (value: string) =>
  value.endsWith("/") ? value.slice(0, -1) : value;

const appBaseUrl = trimTrailingSlash(
  process.env.APP_BASE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000",
);

const sslcommerzComponent = (components as unknown as {
  sslcommerz: SslCommerzComponentApi;
}).sslcommerz;

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);
registerSslCommerzRoutes(http, sslcommerzComponent, {
  successRedirectUrl: `${appBaseUrl}/checkout/success`,
  failRedirectUrl: `${appBaseUrl}/checkout/fail`,
  cancelRedirectUrl: `${appBaseUrl}/checkout/cancel`,
});

export default http;

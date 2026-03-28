import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    BETTER_AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    APP_BASE_URL: z.string().url("APP_BASE_URL must be a valid URL").optional(),
    SSLCOMMERZ_ENVIRONMENT: z.enum(["sandbox", "live"]).default("sandbox"),
    SSLCOMMERZ_STORE_ID: z.string().min(1, "SSLCOMMERZ_STORE_ID is required"),
    SSLCOMMERZ_STORE_PASSWD: z
      .string()
      .min(1, "SSLCOMMERZ_STORE_PASSWD is required"),
    SSLCOMMERZ_VALIDATE_RESPONSE: z
      .string()
      .optional()
      .transform((value) => value === "true"),
    // BETTER_AUTH_GITHUB_CLIENT_ID: z.string(),
    // BETTER_AUTH_GITHUB_CLIENT_SECRET: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_CONVEX_SITE_URL: z
      .string()
      .url("NEXT_PUBLIC_CONVEX_SITE_URL must be a valid URL"),
    NEXT_PUBLIC_SITE_URL: z
      .string()
      .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
      .optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    APP_BASE_URL: process.env.APP_BASE_URL,
    SSLCOMMERZ_ENVIRONMENT: process.env.SSLCOMMERZ_ENVIRONMENT,
    SSLCOMMERZ_STORE_ID: process.env.SSLCOMMERZ_STORE_ID,
    SSLCOMMERZ_STORE_PASSWD: process.env.SSLCOMMERZ_STORE_PASSWD,
    SSLCOMMERZ_VALIDATE_RESPONSE: process.env.SSLCOMMERZ_VALIDATE_RESPONSE,
    // BETTER_AUTH_GITHUB_CLIENT_ID: process.env.BETTER_AUTH_GITHUB_CLIENT_ID,
    // BETTER_AUTH_GITHUB_CLIENT_SECRET:
    //   process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

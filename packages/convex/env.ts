import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export function backendEnv() {
  return createEnv({
    server: {
      CONVEX_DEPLOYMENT: z.string().min(1).optional(),
      NODE_ENV: z.enum(["development", "production"]).optional(),
    },
    runtimeEnv: process.env,
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
    emptyStringAsUndefined: true,
  });
}

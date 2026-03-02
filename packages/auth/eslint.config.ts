import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@better-sslcommerz/eslint-config/base";

export default defineConfig(
  {
    ignores: ["script/**"],
  },
  baseConfig,
  restrictEnvAccess,
);

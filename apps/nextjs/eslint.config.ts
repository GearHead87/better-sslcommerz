import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@better-sslcommerz/eslint-config/base";
import { nextjsConfig } from "@better-sslcommerz/eslint-config/nextjs";
import { reactConfig } from "@better-sslcommerz/eslint-config/react";

export default defineConfig(
  {
    ignores: [".next/**"],
  },
  baseConfig,
  reactConfig,
  nextjsConfig,
  restrictEnvAccess,
);

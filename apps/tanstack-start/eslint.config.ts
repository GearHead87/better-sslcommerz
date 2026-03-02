import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@better-sslcommerz/eslint-config/base";
import { reactConfig } from "@better-sslcommerz/eslint-config/react";

export default defineConfig(
  {
    ignores: [".nitro/**", ".output/**", ".tanstack/**"],
  },
  baseConfig,
  reactConfig,
  restrictEnvAccess,
);

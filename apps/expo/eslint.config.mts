import { defineConfig } from "eslint/config";

import { baseConfig } from "@better-sslcommerz/eslint-config/base";
import { reactConfig } from "@better-sslcommerz/eslint-config/react";

export default defineConfig(
  {
    ignores: [".expo/**", "expo-plugins/**"],
  },
  baseConfig,
  reactConfig,
);

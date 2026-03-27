import { defineConfig } from "eslint/config";

import { baseConfig } from "@better-sslcommerz/eslint-config/base";

export default defineConfig(
  {
    ignores: ["dist/**", "convex/**", "src/**/_generated/**"],
  },
  baseConfig,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);

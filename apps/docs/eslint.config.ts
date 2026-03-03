import { defineConfig } from "eslint/config";

import { baseConfig } from "@better-sslcommerz/eslint-config/base";
import { nextjsConfig } from "@better-sslcommerz/eslint-config/nextjs";
import { reactConfig } from "@better-sslcommerz/eslint-config/react";

export default defineConfig(
  {
    ignores: [
      ".next/**",
      "next-sitemap.config.js",
      "next.config.js",
      "mdx-components.tsx",
      "tailwind.config.ts",
      "typography.ts",
      "src/**",
    ],
  },
  baseConfig,
  reactConfig,
  nextjsConfig,
  {
    files: ["src/app/**/layout.tsx"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
);

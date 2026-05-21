import headlessuiPlugin from "@headlessui/tailwindcss";
import typographyPlugin from "@tailwindcss/typography";

import typographyStyles from "./typography";

export default {
  content: ["./src/**/*.{js,mjs,jsx,ts,tsx,mdx}"],
  darkMode: "selector",
  theme: {
    fontSize: {
      "2xs": ["0.75rem", { lineHeight: "1.25rem" }],
      xs: ["0.8125rem", { lineHeight: "1.5rem" }],
      sm: ["0.875rem", { lineHeight: "1.5rem" }],
      base: ["1rem", { lineHeight: "1.75rem" }],
      lg: ["1.125rem", { lineHeight: "1.75rem" }],
      xl: ["1.25rem", { lineHeight: "1.75rem" }],
      "2xl": ["1.5rem", { lineHeight: "2rem" }],
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      "5xl": ["3rem", { lineHeight: "1" }],
      "6xl": ["3.75rem", { lineHeight: "1" }],
      "7xl": ["4.5rem", { lineHeight: "1" }],
      "8xl": ["6rem", { lineHeight: "1" }],
      "9xl": ["8rem", { lineHeight: "1" }],
    },
    typography: typographyStyles,
    extend: {
      colors: {
        // SSLCOMMERZ brand palette (from docs/design.md)
        brand: {
          DEFAULT: "#295CAB",
          deep: "#2259A7",
          soft: "#5E7DB1",
        },
        action: {
          DEFAULT: "#0173D3",
          tint: "#ECF6FF",
        },
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #295CAB 0%, #0173D3 100%)",
        "brand-gradient-dark":
          "linear-gradient(135deg, rgba(41,92,171,0.25) 0%, rgba(1,115,211,0.15) 100%)",
      },
      boxShadow: {
        glow: "0 0 4px rgb(0 0 0 / 0.1)",
        "brand-glow": "0 0 24px rgba(1, 115, 211, 0.35)",
      },
      maxWidth: {
        lg: "33rem",
        "2xl": "40rem",
        "3xl": "50rem",
        "5xl": "66rem",
      },
      opacity: {
        1: "0.01",
        2.5: "0.025",
        7.5: "0.075",
        15: "0.15",
      },
    },
  },
  plugins: [typographyPlugin, headlessuiPlugin],
};

export interface NavGroup {
  title: string;
  links: {
    href: string;
    title: string;
  }[];
}

export const navigation: NavGroup[] = [
  {
    title: "Getting Started",
    links: [
      { href: "/", title: "Introduction" },
      { href: "/getting-started", title: "Installation" },
      { href: "/configuration", title: "Configuration" },
    ],
  },
  {
    title: "Core API",
    links: [
      { href: "/core/create-session", title: "Create Session" },
      { href: "/core/ipn", title: "IPN Webhooks" },
      { href: "/core/validate-order", title: "Validate Order" },
      { href: "/core/refund", title: "Refunds" },
      { href: "/core/transaction-query", title: "Transaction Query" },
    ],
  },
  {
    title: "Invoice API",
    links: [
      { href: "/invoice/create-invoice", title: "Create Invoice" },
      { href: "/invoice/invoice-status", title: "Invoice Status" },
      { href: "/invoice/invoice-cancel", title: "Cancel Invoice" },
    ],
  },
  {
    title: "Reference",
    links: [
      { href: "/errors", title: "Error Handling" },
      { href: "/types", title: "TypeScript Types" },
    ],
  },
  {
    title: "Articles",
    links: [{ href: "/blog", title: "Blog" }],
  },
];

export const siteConfig = {
  description: "Developer docs for Better SSLCommerz.",
  title: "Better SSLCommerz Docs",
};

export const socials = {
  x: "https://x.com/sslcommerz",
  github: "https://github.com/hosan/better-sslcommerz",
  discord: "https://discord.com",
};

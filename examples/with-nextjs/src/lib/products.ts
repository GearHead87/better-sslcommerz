export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
};

export const products: Product[] = [
  {
    id: "starter-kit",
    name: "Starter Gateway Kit",
    description: "Quick start bundle for sandbox checkout flows.",
    price: 199.0,
    category: "Developer Tools",
  },
  {
    id: "secure-invoice",
    name: "Secure Invoice Pack",
    description: "Invoice templates for clean SSLCommerz handoff.",
    price: 349.0,
    category: "Invoices",
  },
  {
    id: "analytics-lite",
    name: "Analytics Lite",
    description: "Payment tracking widgets for your dashboard.",
    price: 499.0,
    category: "Analytics",
  },
  {
    id: "support-boost",
    name: "Support Boost",
    description: "Priority troubleshooting for gateway issues.",
    price: 259.0,
    category: "Support",
  },
  {
    id: "launch-bundle",
    name: "Launch Bundle",
    description: "Everything you need to ship a checkout experience.",
    price: 899.0,
    category: "Bundles",
  },
];

export const getProductById = (id: string) =>
  products.find((product) => product.id === id);

export interface NavGroup {
  title: string;
  links: {
    href: string;
    title: string;
  }[];
}

export const navigation: NavGroup[] = [
  {
    title: "Documentation",
    links: [
      { href: "/", title: "Introduction" },
      { href: "/getting-started", title: "Getting Started" },
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

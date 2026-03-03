declare module "*.mdx" {
  import type { Metadata } from "next";

  export const metadata: Metadata;
  export const sections: {
    id: string;
    title: string;
    tag?: string;
  }[];
  export const article:
    | {
        title: string;
        description: string;
        date: string;
        tags: string[];
        authors: { name: string; role: string }[];
      }
    | undefined;

  const MDXContent: (props: Record<string, unknown>) => React.JSX.Element;
  export default MDXContent;
}

declare module "@/mdx/search" {
  export interface Result {
    [key: string]: string | undefined;
    pageTitle?: string;
    url: string;
    title: string;
  }

  export function search(query: string, options?: { limit?: number }): Result[];
}

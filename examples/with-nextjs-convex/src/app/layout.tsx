import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { getToken } from "@/lib/auth-server";
import { TRPCReactProvider } from "@/trpc/react";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";

export const metadata: Metadata = {
  title: "SSLCommerz Convex Demo",
  description:
    "Next.js and Convex demo for @better-sslcommerz/convex component integration.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const token = await getToken();
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <ConvexClientProvider initialToken={token}>
          <TRPCReactProvider>
            {children}
          </TRPCReactProvider>
        </ConvexClientProvider>
        <Toaster />
      </body>
    </html>
  );
}

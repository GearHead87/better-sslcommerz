"use client";

import { useAction, useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { api } from "../../../convex/_generated/api";

type DemoProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
};

type SessionStatus = "pending" | "success" | "failed" | "cancelled" | "expired";

type RecentSession = {
  tranId: string;
  sessionKey: string;
  gatewayUrl: string;
  status: SessionStatus;
  amount: string;
  currency: string;
  environment: "sandbox" | "live";
  createdAt: number;
  updatedAt: number;
  productId?: string;
  productName?: string;
};

type CreateSessionResult = {
  tranId: string;
  sessionKey: string;
  gatewayUrl: string;
};

const convexApi = api as unknown as {
  sslcommerz: {
    listDemoProducts: FunctionReference<"query", "public", {}, DemoProduct[]>;
    listRecentSessions: FunctionReference<
      "query",
      "public",
      { limit?: number },
      RecentSession[]
    >;
    createCheckoutSession: FunctionReference<
      "action",
      "public",
      { productId: string },
      CreateSessionResult
    >;
  };
};

const statusStyleMap: Record<SessionStatus, string> = {
  pending: "border-[#2f5b53] bg-[#12342f] text-[#9fe5d5]",
  success: "border-[#2f6642] bg-[#163926] text-[#a8f0ba]",
  failed: "border-[#7a3f3f] bg-[#3a1e1f] text-[#ffb7b7]",
  cancelled: "border-[#6d5640] bg-[#3a2a1c] text-[#ffd8a1]",
  expired: "border-[#45567b] bg-[#1f2b42] text-[#b9ccff]",
};

const toTitleCase = (value: string) =>
  value
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatUpdatedAt = (timestamp: number) =>
  new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));

export function CheckoutDemo() {
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);

  const products = useQuery(convexApi.sslcommerz.listDemoProducts, {}) as
    | DemoProduct[]
    | undefined;
  const recentSessions = useQuery(convexApi.sslcommerz.listRecentSessions, {
    limit: 10,
  }) as RecentSession[] | undefined;
  const createCheckoutSession = useAction(convexApi.sslcommerz.createCheckoutSession) as (
    args: { productId: string },
  ) => Promise<CreateSessionResult>;

  const productList = products ?? [];

  const hasProducts = useMemo(
    () => Array.isArray(products) && products.length > 0,
    [products],
  );

  const handleCheckout = async (productId: string) => {
    setPendingProductId(productId);

    try {
      const session = await createCheckoutSession({ productId });
      toast.success("Session created. Redirecting to SSLCommerz gateway...");
      window.location.href = session.gatewayUrl;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not create session.";
      toast.error(message);
      setPendingProductId(null);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
      <section className="space-y-5">
        <h2 className="text-xl font-semibold text-[#e9fffa] md:text-2xl">
          Demo products
        </h2>

        {!products && (
          <div className="rounded-2xl border border-[#234c45] bg-[#0b221f] p-6 text-sm text-[#9bcfc4]">
            Loading products from Convex...
          </div>
        )}

        {hasProducts && (
          <div className="grid gap-4 md:grid-cols-2">
            {productList.map((product) => {
              const isPending = pendingProductId === product.id;

              return (
                <article
                  key={product.id}
                  className="rounded-2xl border border-[#1f4943] bg-[#0a211d]/90 p-5 shadow-[0_20px_55px_-35px_rgba(15,108,89,0.9)]"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[#89cfbf]">
                    {product.category}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[#ecfffb]">
                    {product.name}
                  </h3>
                  <p className="mt-3 min-h-12 text-sm leading-relaxed text-[#abd8ce]">
                    {product.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <span className="rounded-full border border-[#2a665d] bg-[#11332d] px-3 py-1 text-sm text-[#cbf4eb]">
                      BDT {product.price.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleCheckout(product.id)}
                      disabled={isPending}
                      className="rounded-full bg-[#6fe0c3] px-4 py-2 text-sm font-semibold text-[#06211d] transition hover:bg-[#82ecd1] disabled:cursor-not-allowed disabled:bg-[#37695f] disabled:text-[#97c8be]"
                    >
                      {isPending ? "Creating..." : "Start checkout"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {products && products.length === 0 && (
          <div className="rounded-2xl border border-[#4b2f2f] bg-[#2a1818] p-6 text-sm text-[#ffb7b7]">
            No demo products found.
          </div>
        )}
      </section>

      <aside className="rounded-3xl border border-[#1f4943] bg-[#091d1a] p-6 shadow-[0_30px_70px_-45px_rgba(20,157,132,0.9)]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[#e9fffb]">Recent sessions</h2>
          <span className="rounded-full border border-[#2a5a53] bg-[#102f2a] px-2.5 py-1 text-xs text-[#8fd0c2]">
            live from Convex
          </span>
        </div>

        {!recentSessions && (
          <p className="mt-4 text-sm text-[#9bcfc4]">Loading recent sessions...</p>
        )}

        {recentSessions && recentSessions.length === 0 && (
          <p className="mt-4 text-sm text-[#9bcfc4]">
            No sessions yet. Start a checkout to create one.
          </p>
        )}

        {recentSessions && recentSessions.length > 0 && (
          <div className="mt-4 space-y-3">
            {recentSessions.map((session) => (
              <article
                key={session.tranId}
                className="rounded-2xl border border-[#1f4943] bg-[#0c2a25] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#d7fbf3]">
                      {session.productName ?? session.productId ?? "Unknown product"}
                    </p>
                    <p className="mt-1 text-xs text-[#99cec3]">{session.tranId}</p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs ${statusStyleMap[session.status]}`}
                  >
                    {toTitleCase(session.status)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#a7d7ce]">
                  <span>
                    {session.currency} {session.amount}
                  </span>
                  <span>{formatUpdatedAt(session.updatedAt)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

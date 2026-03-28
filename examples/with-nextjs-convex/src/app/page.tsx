import { CheckoutDemo } from "@/components/sslcommerz/CheckoutDemo";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#041314] text-[#e3f7f2]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(70,209,170,0.18),transparent_58%),radial-gradient(circle_at_20%_85%,rgba(239,186,83,0.18),transparent_50%)]" />
      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 md:py-16">
        <header className="space-y-5">
          <p className="text-xs uppercase tracking-[0.32em] text-[#8ad3c2]">
            Better SSLCommerz + Convex
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-[#f2fffb] md:text-6xl">
            with-nextjs-convex example using the new component package.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[#b6ddd5] md:text-lg">
            This storefront creates real SSLCommerz checkout sessions through
            Convex actions backed by `@better-sslcommerz/convex`.
          </p>
          <div className="rounded-2xl border border-[#1f4e47] bg-[#0b231f]/70 px-4 py-3 text-sm text-[#9ed3c8]">
            IPN and callback routes are served by Convex HTTP endpoints at
            `/sslcommerz/ipn`, `/sslcommerz/success`, `/sslcommerz/fail`, and
            `/sslcommerz/cancel`.
          </div>
        </header>

        <CheckoutDemo />
      </section>
    </main>
  );
}

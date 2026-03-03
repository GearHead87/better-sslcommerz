import { products } from "@/lib/products";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            SSLCommerz Demo Store
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
            Pick a product to run a live checkout session.
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Each product creates a new SSLCommerz payment session and redirects
            you to the hosted gateway. The callbacks and IPN route validate the
            payment and log the payload.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {products.map((product) => (
            <article
              key={product.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {product.category}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold">
                    {product.name}
                  </h2>
                  <p className="mt-3 text-sm text-slate-300">
                    {product.description}
                  </p>
                </div>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200">
                  BDT {product.price.toFixed(2)}
                </span>
              </div>

              <form
                className="mt-6"
                action="/api/sslcommerz/session"
                method="post"
              >
                <input type="hidden" name="productId" value={product.id} />
                <button
                  className="w-full rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300"
                  type="submit"
                >
                  Start checkout
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

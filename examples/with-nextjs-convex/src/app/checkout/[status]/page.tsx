import Link from "next/link";
import { notFound } from "next/navigation";

const statusContent = {
  success: {
    label: "Payment successful",
    description:
      "SSLCommerz confirmed the payment and Convex stored the latest transaction state.",
    style: "border-[#2b6c49] bg-[#122d20] text-[#b8f4cb]",
  },
  fail: {
    label: "Payment failed",
    description:
      "The gateway reported a failed payment. You can retry checkout with any demo product.",
    style: "border-[#784646] bg-[#351d1d] text-[#ffc6c6]",
  },
  cancel: {
    label: "Payment cancelled",
    description:
      "Checkout was cancelled before completion. Start another session when ready.",
    style: "border-[#775f44] bg-[#392a1d] text-[#ffe1ba]",
  },
} as const;

type CheckoutStatus = keyof typeof statusContent;

export default async function CheckoutStatusPage({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = await params;

  if (!(status in statusContent)) {
    notFound();
  }

  const content = statusContent[status as CheckoutStatus];

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#061614] px-4 py-10 text-[#e6fcf7]">
      <section className="w-full max-w-xl rounded-3xl border border-[#1f5048] bg-[#0b2521] p-8 shadow-[0_40px_90px_-55px_rgba(13,116,96,0.9)]">
        <p
          className={`inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${content.style}`}
        >
          {status}
        </p>
        <h1 className="mt-5 text-3xl font-semibold text-[#f0fffb]">{content.label}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#b8dfd6]">
          {content.description}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-[#6fe0c3] px-5 py-2 text-sm font-semibold text-[#06211d] transition hover:bg-[#8cecd5]"
          >
            Back to store
          </Link>
          <p className="text-xs text-[#8ec6bb]">
            Check the "Recent sessions" panel on the homepage for latest state.
          </p>
        </div>
      </section>
    </main>
  );
}

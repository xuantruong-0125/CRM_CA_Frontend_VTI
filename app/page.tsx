import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white md:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-600/20 to-sky-800/20 p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">CRM Platform</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
            Frontend Next.js cho quan ly Lead theo domain module
          </h1>
          <p className="mt-4 text-sm text-slate-200">
            Build voi App Router, React Query, React Hook Form va Zod schema.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <h2 className="text-lg font-semibold">Dieu huong nhanh</h2>
          <div className="mt-4 space-y-3">
            <Link
              href="/customers"
              className="block rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Mo module Customers
            </Link>
            <Link
              href="/leads"
              className="block rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Mo module Leads
            </Link>
            <Link
              href="/system/organizations"
              className="block rounded-xl border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Mo module Organizations
            </Link>
          </div>
        </section>
      </div>
      </main>
  );
}

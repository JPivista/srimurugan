import Link from "next/link";
import { DbConnect } from "@/components/DbConnect";
import { EntryList } from "@/components/EntryList";
import { loadOrFail } from "@/lib/db";
import { formatINR } from "@/lib/format";
import { getDashboard } from "@/lib/ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const result = await loadOrFail(getDashboard);
  if (!result.data) {
    return <DbConnect failure={result.failure ?? { message: "The books could not be opened." }} />;
  }
  const book = result.data;
  const fresh = book.given === 0 && book.received === 0 && book.expenses === 0;

  return (
      <div className="space-y-5">
        <img
          src="/banner.jpg"
          alt="Sree Murugan Financials, 6/X2/E, Karamadai Nayakkan Thottam, Selakkarichal - 641 658. +91 99522 17477, +91 90032 53515"
          className="-mx-3 w-[calc(100%+1.5rem)] max-w-none border-y border-gold/50 sm:mx-0 sm:w-full sm:rounded-2xl sm:border"
        />
        <section className="rounded-3xl border border-gold/40 bg-maroon px-4 py-5 text-white shadow-sm sm:px-5 sm:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
            Bank balance
          </p>
          <p className="mt-2 font-display text-[1.85rem] leading-none sm:text-5xl">
            {formatINR(book.bankBalance)}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/85 sm:text-sm">
            <div>
              <dt className="text-white/60">Opening</dt>
              <dd>{formatINR(book.openingBalance)}</dd>
            </div>
            <div>
              <dt className="text-white/60">Given</dt>
              <dd>{formatINR(book.given)}</dd>
            </div>
            <div>
              <dt className="text-white/60">Received</dt>
              <dd>{formatINR(book.received)}</dd>
            </div>
            <div>
              <dt className="text-brass/90">Expenses</dt>
              <dd className="text-brass">{formatINR(book.expenses)}</dd>
            </div>
          </dl>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <article className="rounded-2xl border-2 border-gold bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">
              Profit
            </p>
            <p className="mt-2 font-display text-xl text-ink sm:text-2xl">{formatINR(book.profit)}</p>
            <p className="mt-1 text-xs leading-5 text-ink/55">Commission on money received</p>
          </article>
          <article className="rounded-2xl border border-line bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
              With customers
            </p>
            <p className="mt-2 font-display text-xl sm:text-2xl">{formatINR(book.withCustomers)}</p>
            <p className="mt-1 text-xs leading-5 text-ink/55">Given and still out</p>
          </article>
        </div>

        <section className="grid grid-cols-3 gap-2">
          {[
            ["Given today", book.todayGiven],
            ["Received today", book.todayReceived],
            ["Expenses today", book.todayExpenses],
          ].map(([label, value]) => (
            <article
              key={String(label)}
              className={`min-w-0 rounded-2xl bg-white px-2 py-3 sm:px-3 ${label === "Expenses today" ? "border-2 border-gold" : ""}`}
            >
              <p className={`text-[11px] leading-4 ${label === "Expenses today" ? "text-ink" : "text-ink/50"}`}>
                {label}
              </p>
              <p className="mt-1 text-xs font-semibold text-ink sm:text-sm">
                {formatINR(Number(value))}
              </p>
            </article>
          ))}
        </section>

        {fresh && book.openingBalance === 0 ? (
          <p className="rounded-2xl border border-line bg-card px-4 py-3 text-sm leading-6">
            Set the cash already in the bank before the first entry.{" "}
            <Link href="/app/settings" className="font-semibold text-maroon">
              Open bank settings
            </Link>
          </p>
        ) : null}

        <Link
          href="/app/entry"
          className="block min-h-12 rounded-xl bg-gold px-4 py-3.5 text-center text-sm font-semibold text-ink"
        >
          New entry
        </Link>

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-xl">Recent</h2>
            <Link href="/app/ledger" className="text-sm text-ink">
              Full ledger
            </Link>
          </div>
          <EntryList entries={book.recent} empty="No records yet." />
        </section>
      </div>
  );
}

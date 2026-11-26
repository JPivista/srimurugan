import { DbConnect } from "@/components/DbConnect";
import { RecordsTable } from "@/components/RecordsTable";
import { loadOrFail } from "@/lib/db";
import { listEntries } from "@/lib/ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; q?: string; from?: string; to?: string }>;
}) {
  const filters = await searchParams;
  const result = await loadOrFail(() => listEntries(filters));
  if (!result.data) {
    return <DbConnect failure={result.failure ?? { message: "The books could not be opened." }} />;
  }
  const entries = result.data;
  return (
    <div>
      <h1 className="font-display text-3xl">Records</h1>
      <p className="mt-1 text-sm text-ink/60">Every entry on one line.</p>
      <form className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2" action="/app/records">
        <select
          name="kind"
          defaultValue={filters.kind || ""}
          aria-label="Type"
          className="rounded-xl border border-line bg-card px-3 py-3 text-sm"
        >
          <option value="">All types</option>
          <option value="give">Give</option>
          <option value="receive">Receive</option>
          <option value="expense">Expense</option>
        </select>
        <input
          name="q"
          defaultValue={filters.q || ""}
          placeholder="Name or reason"
          aria-label="Search"
          className="rounded-xl border border-line bg-card px-3 py-3 text-base"
        />
        <input
          name="from"
          type="date"
          defaultValue={filters.from || ""}
          aria-label="From date"
          className="rounded-xl border border-line bg-card px-3 py-3 text-sm"
        />
        <input
          name="to"
          type="date"
          defaultValue={filters.to || ""}
          aria-label="To date"
          className="rounded-xl border border-line bg-card px-3 py-3 text-sm"
        />
        <button
          type="submit"
          className="rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-ink sm:col-span-2"
        >
          Apply filter
        </button>
      </form>
      <div className="mt-5">
        {entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-card px-4 py-8 text-center text-sm text-ink/60">
            Nothing matches this filter.
          </p>
        ) : (
          <RecordsTable entries={entries} />
        )}
      </div>
    </div>
  );
}

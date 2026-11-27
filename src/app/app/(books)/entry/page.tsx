import { DbConnect } from "@/components/DbConnect";
import { EntryForm } from "@/components/EntryForm";
import { loadOrFail } from "@/lib/db";
import { blankEntry, customerDues, customerNames, getDashboard, getEntry } from "@/lib/ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EntryPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id: idRaw } = await searchParams;
  const id = idRaw ? Number(idRaw) : undefined;

  const result = await loadOrFail(() =>
    Promise.all([
      customerNames(),
      getDashboard(),
      id && Number.isInteger(id) ? getEntry(id) : Promise.resolve(null),
      customerDues(id && Number.isInteger(id) ? id : undefined),
    ]),
  );
  if (!result.data) {
    return <DbConnect failure={result.failure ?? { message: "The books could not be opened." }} />;
  }
  const [names, book, existing, dues] = result.data;

  return (
      <div>
        <h1 className="font-display text-3xl">{existing ? "Edit record" : "New record"}</h1>
        <p className="mt-1 mb-5 text-sm text-ink/60">
          {existing
            ? "Update this line. Balances recalculate from the full ledger."
            : "Give, receive, or record an expense."}
        </p>
        {id && !existing ? (
          <p className="mb-4 text-sm text-maroon">That record was not found. You can add a new one.</p>
        ) : null}
        <EntryForm
          initial={blankEntry(existing ?? undefined)}
          names={names}
          dues={dues}
          bankBalance={book.bankBalance}
          cashInHand={book.cashInHand}
        />
      </div>
  );
}

import { DbConnect } from "@/components/DbConnect";
import { SettingsForm } from "@/components/SettingsForm";
import { loadOrFail } from "@/lib/db";
import { formatINR } from "@/lib/format";
import { getDashboard } from "@/lib/ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const result = await loadOrFail(getDashboard);
  if (!result.data) {
    return <DbConnect failure={result.failure ?? { message: "The books could not be opened." }} />;
  }
  const book = result.data;
  return (
      <div>
        <h1 className="font-display text-3xl">Bank</h1>
        <p className="mt-2 text-sm leading-6 text-ink/70">
          Enter the cash already in the account before this ledger starts.
          Giving money and expenses reduce the bank. Receiving the principal puts it back.
          Commission stays in profit.
        </p>
        <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm">
          Current bank balance {formatINR(book.bankBalance)} from opening {formatINR(book.openingBalance)}.
        </p>
        <SettingsForm openingBalance={book.openingBalance} />
      </div>
  );
}

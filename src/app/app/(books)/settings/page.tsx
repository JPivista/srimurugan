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
          Enter the money already in the bank, and the cash already in hand, before this ledger starts.
          A give or receive marked Cash changes cash in hand. Bank and UPI change the bank.
          Expenses reduce the bank. Commission stays in profit.
        </p>
        <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm">
          Bank {formatINR(book.bankBalance)} from opening {formatINR(book.openingBalance)}. Cash in hand{" "}
          {formatINR(book.cashInHand)} from opening {formatINR(book.openingCash)}.
        </p>
        <SettingsForm openingBalance={book.openingBalance} openingCash={book.openingCash} />
      </div>
  );
}

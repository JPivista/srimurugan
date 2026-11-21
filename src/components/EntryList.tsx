import Link from "next/link";
import { DeleteEntry } from "./DeleteEntry";
import { formatDate, formatINR } from "@/lib/format";
import type { Entry } from "@/lib/types";

const kindLabel = {
  give: "Give",
  receive: "Receive",
  expense: "Expense",
} as const;

const kindClass = {
  give: "bg-maroon/10 text-maroon",
  receive: "bg-gold text-ink",
  expense: "bg-gold text-ink",
} as const;

const modeLabel = {
  cash: "Cash",
  bank: "Bank",
  upi: "UPI",
} as const;

export function EntryList({
  entries,
  empty,
}: {
  entries: Entry[];
  empty: string;
}) {
  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-card px-4 py-8 text-center text-sm text-ink/60">
        {empty}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => {
        const title =
          entry.kind === "expense" ? entry.reason || "Expense" : entry.customerName;
        const meta = [
          entry.accountNumber ? `A/c ${entry.accountNumber}` : "",
          entry.mobile || "",
          entry.paymentMode
            ? `Received through ${modeLabel[entry.paymentMode]}`
            : "",
        ]
          .filter(Boolean)
          .join(" · ");
        return (
          <li key={entry.id} className="rounded-2xl border border-line bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-ink/50">{formatDate(entry.txnDate)}</p>
                <p className="mt-1 truncate font-medium">{title}</p>
                {entry.kind === "receive" && entry.receivedFrom ? (
                  <p className="mt-1 text-xs text-ink/70">Received from {entry.receivedFrom}</p>
                ) : null}
                {meta ? <p className="mt-1 text-xs text-ink/55">{meta}</p> : null}
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${kindClass[entry.kind]}`}>
                {kindLabel[entry.kind]}
              </span>
            </div>
            <p className="mt-3 font-display text-xl sm:text-2xl">{formatINR(entry.amount)}</p>
            {entry.kind !== "expense" && entry.commissionAmount > 0 ? (
              <p className="mt-1 text-sm text-ink/70">
                Commission {formatINR(entry.commissionAmount)}
                {entry.commissionPerLakh != null
                  ? ` · ₹${entry.commissionPerLakh} per lakh`
                  : ""}
                {entry.kind === "give" ? " · counted when received" : " · in profit"}
              </p>
            ) : null}
            {entry.kind === "give" && (entry.returnDate || entry.returnAmount != null) ? (
              <p className="mt-1 text-sm text-ink/70">
                {entry.returnAmount != null ? `Return ${formatINR(entry.returnAmount)}` : "Return"}
                {entry.returnDate ? ` on ${formatDate(entry.returnDate)}` : ""}
              </p>
            ) : null}
            {entry.notes ? <p className="mt-2 text-sm text-ink/70">{entry.notes}</p> : null}
            <div className="mt-3 flex items-center gap-4">
              <Link
                href={`/app/entry?id=${entry.id}`}
                className="rounded-lg bg-gold px-3 py-1.5 text-sm font-semibold text-ink"
              >
                Edit
              </Link>
              <DeleteEntry id={entry.id} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

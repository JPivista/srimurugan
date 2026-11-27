import { formatDate, formatINR } from "@/lib/format";
import type { Entry } from "@/lib/types";

const kindLabel = {
  give: "Given",
  receive: "Received",
  expense: "Expense",
} as const;

const kindClass = {
  give: "bg-maroon/25 text-maroon",
  receive: "bg-emerald-600 text-white",
  expense: "bg-red-800 text-white",
} as const;

export function RecordsTable({ entries }: { entries: Entry[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-card">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-ink/55">
          <tr>
            <th className="px-3 py-3 font-semibold">Date</th>
            <th className="px-3 py-3 font-semibold">Name</th>
            <th className="px-3 py-3 font-semibold">Type</th>
            <th className="px-3 py-3 font-semibold">Amount</th>
            <th className="px-3 py-3 font-semibold">Commission</th>
            <th className="px-3 py-3 font-semibold">Return</th>
            <th className="px-3 py-3 font-semibold">Return date</th>
            <th className="px-3 py-3 font-semibold">Profit</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const name =
              entry.kind === "expense" ? entry.reason || "Expense" : entry.customerName || "";
            return (
              <tr key={entry.id} className="border-b border-line/80 last:border-0">
                <td className="whitespace-nowrap px-3 py-3">{formatDate(entry.txnDate)}</td>
                <td className="whitespace-nowrap px-3 py-3 font-medium">{name}</td>
                <td className="whitespace-nowrap px-3 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${kindClass[entry.kind]}`}
                  >
                    {kindLabel[entry.kind]}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 font-medium">{formatINR(entry.amount)}</td>
                <td className="whitespace-nowrap px-3 py-3">
                  {entry.kind !== "expense" && entry.commissionAmount > 0
                    ? formatINR(entry.commissionAmount)
                    : ""}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {entry.returnAmount != null ? formatINR(entry.returnAmount) : ""}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {entry.returnDate ? formatDate(entry.returnDate) : ""}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {entry.kind === "receive" && entry.commissionAmount > 0
                    ? formatINR(entry.commissionAmount)
                    : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

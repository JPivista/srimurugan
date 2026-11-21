import Link from "next/link";
import { DbConnect } from "@/components/DbConnect";
import { loadOrFail } from "@/lib/db";
import { formatINR } from "@/lib/format";
import { customerRollups } from "@/lib/ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const result = await loadOrFail(customerRollups);
  if (!result.data) {
    return <DbConnect failure={result.failure ?? { message: "The books could not be opened." }} />;
  }
  const people = result.data;
  return (
      <div>
        <h1 className="font-display text-3xl">People</h1>
        <p className="mt-1 mb-5 text-sm text-ink/60">
          Outstanding is money given that has not been received back.
        </p>
        {people.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-card px-4 py-8 text-center text-sm text-ink/60">
            No customers yet.{" "}
            <Link href="/app/entry" className="font-semibold text-maroon">
              Add a give
            </Link>
          </p>
        ) : (
          <ul className="space-y-3">
            {people.map((person) => (
              <li key={person.name.toLowerCase()} className="rounded-2xl border border-line bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{person.name}</p>
                    <p className="mt-1 text-xs text-ink/55">
                      {[
                        person.accountNumber ? `A/c ${person.accountNumber}` : "",
                        person.mobile || "",
                      ]
                        .filter(Boolean)
                        .join(" · ") || "No account number"}
                    </p>
                  </div>
                  <p className="text-right">
                    <span className="block text-[11px] uppercase tracking-wide text-ink/45">
                      Out
                    </span>
                    <span className="font-display text-lg sm:text-xl">{formatINR(person.outstanding)}</span>
                  </p>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-[11px] sm:text-xs">
                  <div>
                    <dt className="text-ink/45">Given</dt>
                    <dd className="mt-0.5 font-medium">{formatINR(person.given)}</dd>
                  </div>
                  <div>
                    <dt className="text-ink/45">Received</dt>
                    <dd className="mt-0.5 font-medium">{formatINR(person.received)}</dd>
                  </div>
                  <div>
                    <dt className="text-ink/45">Profit</dt>
                    <dd className="mt-0.5 font-medium text-ink">{formatINR(person.commissionEarned)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>
  );
}

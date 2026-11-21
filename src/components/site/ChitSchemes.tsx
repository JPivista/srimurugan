"use client";

import { useState } from "react";
import { formatINR } from "@/lib/format";
import { chitSchemes } from "@/lib/chits";

export function ChitSchemes() {
  const [id, setId] = useState(chitSchemes[0].id);
  const scheme = chitSchemes.find((item) => item.id === id) ?? chitSchemes[0];
  const halfway = Math.ceil(scheme.rows.length / 2);
  const columns = [scheme.rows.slice(0, halfway), scheme.rows.slice(halfway)];

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {chitSchemes.map((item) => {
          const on = item.id === scheme.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setId(item.id)}
              className={`shrink-0 rounded-full border px-3 py-2 text-left text-sm ${
                on ? "border-gold bg-gold text-ink" : "border-line bg-white text-ink"
              }`}
            >
              <span className="block font-semibold">{formatINR(item.value)}</span>
              <span className="block text-xs opacity-70">{item.members} members</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-3xl border border-line bg-white p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-maroon">
          {scheme.members} members · {scheme.months} months
        </p>
        <h3 className="mt-1 font-display text-2xl sm:text-3xl">{formatINR(scheme.value)}</h3>
        <p className="mt-1 text-sm text-ink/70">
          Monthly installment {formatINR(scheme.installment)}. {scheme.note}
        </p>
        <p className="mt-2 text-xs text-ink/50">
          The published notice starts at month 2. Prize amount is the sum for the member who takes the chit that month.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {columns.map((rows, column) => (
            <div key={column} className="overflow-x-auto">
              <table className="w-full min-w-[16rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-ink/50">
                    <th className="py-2 pr-3 font-medium">Month</th>
                    <th className="py-2 pr-3 font-medium">Installment</th>
                    <th className="py-2 font-medium">Prize</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.month} className="border-b border-line/70">
                      <td className="py-2 pr-3">{row.month}</td>
                      <td className="py-2 pr-3">{formatINR(row.installment)}</td>
                      <td className="py-2 font-medium">{formatINR(row.prize)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

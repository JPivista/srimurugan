"use client";

import { removeTransaction } from "@/app/actions";

export function DeleteEntry({ id }: { id: number }) {
  return (
    <form
      action={removeTransaction}
      onSubmit={(event) => {
        if (!confirm("Delete this record from the ledger?")) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="rounded-lg bg-red-700 px-3 py-1.5 text-sm font-semibold text-white">
        Delete
      </button>
    </form>
  );
}

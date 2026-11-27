"use client";

import { useActionState } from "react";
import { saveBankBalance } from "@/app/actions";

export function SettingsForm({
  openingBalance,
  openingCash,
}: {
  openingBalance: number;
  openingCash: number;
}) {
  const [state, action, pending] = useActionState(saveBankBalance, {});

  return (
    <form action={action} className="mt-5 space-y-3" key={`${openingBalance}-${openingCash}`}>
      <label className="block text-sm font-medium" htmlFor="openingBalance">
        Opening bank balance
        <span className="text-red-600" aria-hidden="true">
          {" "}
          *
        </span>
        <input
          id="openingBalance"
          name="openingBalance"
          inputMode="decimal"
          required
          defaultValue={openingBalance ? String(openingBalance) : ""}
          className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-3 text-base outline-none focus:ring-2 focus:ring-maroon/30"
        />
      </label>
      <label className="block text-sm font-medium" htmlFor="openingCash">
        Opening cash in hand
        <span className="text-red-600" aria-hidden="true">
          {" "}
          *
        </span>
        <input
          id="openingCash"
          name="openingCash"
          inputMode="decimal"
          required
          defaultValue={String(openingCash)}
          className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-3 text-base outline-none focus:ring-2 focus:ring-maroon/30"
        />
      </label>
      {state.error ? (
        <p className="text-sm text-maroon" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-leaf" role="status">
          Balances saved. The home screen uses them immediately.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gold px-4 py-3.5 text-base font-semibold text-ink disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save balances"}
      </button>
    </form>
  );
}

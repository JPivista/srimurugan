"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { saveTransaction } from "@/app/actions";
import { CustomerPicker } from "@/components/CustomerPicker";
import { commissionFor, commissionFromReturn, formatINR, parseMoney, parseRate } from "@/lib/format";
import type { EntryInput, Kind } from "@/lib/types";

const kinds: { id: Kind; label: string; hint: string }[] = [
  {
    id: "give",
    label: "Give",
    hint: "Entry. The amount leaves the bank. Commission is stored and added to profit only when you receive the money.",
  },
  {
    id: "receive",
    label: "Receive",
    hint: "Entry. The amount returns to the bank, and the commission is added to profit.",
  },
  {
    id: "expense",
    label: "Expense",
    hint: "Reason and amount. The amount leaves the bank.",
  },
];

const field =
  "mt-1 w-full rounded-xl border border-line bg-white px-3 py-3 text-base outline-none focus:ring-2 focus:ring-maroon/30";

function RequiredMark() {
  return (
    <span className="text-red-600" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

export function EntryForm({
  initial,
  names,
  bankBalance,
}: {
  initial: EntryInput;
  names: string[];
  bankBalance: number;
}) {
  const [state, action, pending] = useActionState(saveTransaction, {});
  const [kind, setKind] = useState<Kind>(initial.kind);
  const [amount, setAmount] = useState(initial.amount);
  const [returnAmount, setReturnAmount] = useState(initial.returnAmount);
  const [rate, setRate] = useState(initial.commissionPerLakh || "250");
  const selected = kinds.find((item) => item.id === kind) ?? kinds[0];

  const preview = useMemo(() => {
    const rupees = parseMoney(amount);
    if (rupees == null) return "";
    if (kind === "expense") return `Bank reduces by ${formatINR(rupees)}.`;
    const bankLine =
      kind === "give"
        ? `Bank reduces by ${formatINR(rupees)}.`
        : `Bank increases by ${formatINR(rupees)}.`;
    if (kind === "give") {
      const returned = parseMoney(returnAmount);
      if (returned != null) {
        const commission = commissionFromReturn(rupees, returned);
        if (commission > 0) return `${bankLine} Commission ${formatINR(commission)}.`;
        if (commission < 0) return `${bankLine} Return amount is less than the amount given.`;
        return bankLine;
      }
    }
    if (rate.trim() === "") return bankLine;
    const perLakh = parseRate(rate);
    if (perLakh == null) return bankLine;
    const commission = commissionFor(rupees, perLakh);
    if (kind === "give") {
      return `${bankLine} Commission ${formatINR(commission)} is saved for when this money comes back.`;
    }
    return `${bankLine} Profit increases by ${formatINR(commission)}.`;
  }, [amount, kind, rate, returnAmount]);

  const rupees = parseMoney(amount);
  const overdrawn =
    (kind === "give" || kind === "expense") &&
    rupees != null &&
    rupees > bankBalance;

  return (
    <form action={action} className="space-y-5">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="kind" value={kind} />

      <div>
        <p className="text-sm font-medium" id="kind-label">
          Type
          <RequiredMark />
        </p>
        <div
          role="radiogroup"
          aria-labelledby="kind-label"
          className="mt-2 grid grid-cols-3 gap-2"
        >
          {kinds.map((item) => {
            const on = kind === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setKind(item.id)}
                className={`min-h-12 rounded-xl border px-1 text-xs font-semibold sm:text-sm ${
                  on
                    ? "border-gold bg-gold text-ink"
                    : "border-line bg-card text-ink"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-sm leading-6 text-ink/65">{selected.hint}</p>
      </div>

      {kind === "expense" ? (
        <label className="block text-sm font-medium" htmlFor="reason">
          Reason
          <RequiredMark />
          <input
            id="reason"
            name="reason"
            required
            defaultValue={initial.reason}
            placeholder="Tea, fuel, office rent"
            className={field}
          />
        </label>
      ) : (
        <>
          <CustomerPicker
            id="customerName"
            name="customerName"
            label="Customer name"
            required
            names={names}
            defaultValue={initial.customerName}
          />
          {kind === "receive" ? (
            <CustomerPicker
              id="receivedFrom"
              name="receivedFrom"
              label="Received from"
              names={names}
              defaultValue={initial.receivedFrom}
            />
          ) : null}
        </>
      )}

      <label className="block text-sm font-medium" htmlFor="amount">
        Amount
        <RequiredMark />
        <input
          id="amount"
          name="amount"
          required
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className={field}
        />
      </label>

      <label className="block text-sm font-medium" htmlFor="txnDate">
        Date
        <RequiredMark />
        <input
          id="txnDate"
          name="txnDate"
          type="date"
          required
          defaultValue={initial.txnDate}
          className={field}
        />
      </label>

      {kind === "give" ? (
        <>
          <label className="block text-sm font-medium" htmlFor="returnDate">
            Return date
            <input
              id="returnDate"
              name="returnDate"
              type="date"
              defaultValue={initial.returnDate}
              className={field}
            />
          </label>
          <label className="block text-sm font-medium" htmlFor="returnAmount">
            Return amount
            <input
              id="returnAmount"
              name="returnAmount"
              inputMode="decimal"
              value={returnAmount}
              onChange={(event) => setReturnAmount(event.target.value)}
              className={field}
            />
          </label>
        </>
      ) : null}

      {kind !== "expense" ? (
        <>
          <label className="block text-sm font-medium" htmlFor="commissionPerLakh">
            Commission per lakh
            <input
              id="commissionPerLakh"
              name="commissionPerLakh"
              inputMode="decimal"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
              className={field}
            />
          </label>
          <label className="block text-sm font-medium" htmlFor="paymentMode">
            Received through
            <select
              id="paymentMode"
              name="paymentMode"
              defaultValue={initial.paymentMode}
              className={field}
            >
              <option value="bank">Bank</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
            </select>
          </label>
          <label className="block text-sm font-medium" htmlFor="accountNumber">
            Account number
            <input
              id="accountNumber"
              name="accountNumber"
              defaultValue={initial.accountNumber}
              inputMode="numeric"
              className={field}
            />
          </label>
          <label className="block text-sm font-medium" htmlFor="mobile">
            Mobile
            <input
              id="mobile"
              name="mobile"
              defaultValue={initial.mobile}
              inputMode="tel"
              autoComplete="tel"
              className={field}
            />
          </label>
          <label className="block text-sm font-medium" htmlFor="notes">
            Notes
            <textarea
              id="notes"
              name="notes"
              rows={2}
              defaultValue={initial.notes}
              className={field}
            />
          </label>
        </>
      ) : null}

      {preview ? (
        <p className="rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-ink/80">{preview}</p>
      ) : null}
      {overdrawn ? (
        <p className="text-sm text-clay" role="status">
          This is more than the current bank balance of {formatINR(bankBalance)}. You can still save it.
        </p>
      ) : null}
      {state.error ? (
        <p className="text-sm text-maroon" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gold px-4 py-3.5 text-base font-semibold text-ink disabled:opacity-60"
      >
        {pending ? "Saving…" : initial.id ? "Update record" : "Save record"}
      </button>
      {initial.id ? (
        <Link href="/app/ledger" className="block text-center text-sm text-ink/60">
          Cancel edit
        </Link>
      ) : null}
    </form>
  );
}

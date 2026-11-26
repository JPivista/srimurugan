"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { saveTransaction } from "@/app/actions";
import { CustomerPicker } from "@/components/CustomerPicker";
import {
  commissionFor,
  commissionFromReturn,
  commissionOnReceipt,
  daysCharged,
  expectedReceipt,
  formatINR,
  plannedReceipt,
  parseMoney,
  parseRate,
  rateForReceipt,
  suggestedReturn,
} from "@/lib/format";
import type { CustomerDue, EntryInput, Kind } from "@/lib/types";

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
  dues,
  bankBalance,
}: {
  initial: EntryInput;
  names: string[];
  dues: CustomerDue[];
  bankBalance: number;
}) {
  const [state, action, pending] = useActionState(saveTransaction, {});
  const [kind, setKind] = useState<Kind>(initial.kind);
  const [customerName, setCustomerName] = useState(initial.customerName);
  const [amount, setAmount] = useState(initial.amount);
  const [txnDate, setTxnDate] = useState(initial.txnDate);
  const [returnDate, setReturnDate] = useState(initial.returnDate);
  const [returnAmount, setReturnAmount] = useState(initial.returnAmount);
  const [rate, setRate] = useState(initial.commissionPerLakh || "300");
  const returnTouched = useRef(Boolean(initial.returnAmount));
  const receiveAmountTouched = useRef(initial.kind === "receive" && Boolean(initial.amount));
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
    if (kind === "receive") {
      const due = dueFor(customerName);
      const commission = commissionOnReceipt(rupees, due?.principal ?? 0);
      return `${bankLine} Profit increases by ${formatINR(commission)}.`;
    }
    if (rate.trim() === "") return bankLine;
    const perLakh = parseRate(rate);
    if (perLakh == null) return bankLine;
    const commission = commissionFor(rupees, perLakh);
    return `${bankLine} Commission ${formatINR(commission)} is saved for when this money comes back.`;
  }, [amount, customerName, dues, kind, rate, returnAmount]);

  function dueFor(name: string) {
    const key = name.trim().toLowerCase();
    return dues.find((item) => item.name.toLowerCase() === key) ?? null;
  }

  function expectedFor(name: string, receiveDate: string) {
    const due = dueFor(name);
    if (!due || due.principal <= 0) return null;
    return expectedReceipt(due.loans, receiveDate) ?? (due.expected > 0 ? due.expected : null);
  }

  function applyReceipt(
    name: string,
    collectedRaw: string,
    manual: boolean,
    receiveDate = txnDate,
    useGiven = false,
  ) {
    const due = dueFor(name);
    if (!due || due.principal <= 0) {
      if (!manual) {
        setAmount("");
        setRate("300");
      }
      return;
    }
    const givenDate = due.loans
      .filter((loan) => loan.principal > 0 && loan.returnDate)
      .map((loan) => loan.returnDate as string)
      .sort()
      .at(-1);
    const date = useGiven && givenDate ? givenDate : receiveDate;
    if (useGiven && givenDate) setTxnDate(givenDate);
    const expected = useGiven
      ? (plannedReceipt(due.loans) ?? expectedFor(name, date))
      : expectedFor(name, date);
    const collected = manual ? parseMoney(collectedRaw) : expected;
    if (!manual && expected != null) setAmount(String(expected));
    if (collected == null) return;
    setRate(String(rateForReceipt(collected, due.principal)));
  }

  useEffect(() => {
    if (kind !== "give" || returnTouched.current) return;
    const rupees = parseMoney(amount);
    const perLakh = parseRate(rate);
    if (rupees == null || perLakh == null || !txnDate || !returnDate) {
      setReturnAmount("");
      return;
    }
    const suggested = suggestedReturn(rupees, perLakh, txnDate, returnDate);
    setReturnAmount(suggested == null ? "" : String(suggested));
  }, [amount, kind, rate, returnDate, txnDate]);

  function editSource(update: () => void) {
    returnTouched.current = false;
    update();
  }

  const chargedDays =
    kind === "give" ? daysCharged(txnDate, returnDate) : null;

  const commissionField = (
    <label className="block text-sm font-medium" htmlFor="commissionPerLakh">
      Commission per lakh
      <input
        id="commissionPerLakh"
        name="commissionPerLakh"
        inputMode="decimal"
        value={rate}
        readOnly={kind === "receive"}
        onChange={(event) => editSource(() => setRate(event.target.value))}
        className={field}
      />
    </label>
  );

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
                onClick={() => {
                  setKind(item.id);
                  if (item.id === "receive") {
                    receiveAmountTouched.current = false;
                    applyReceipt(customerName, amount, false, txnDate, true);
                  }
                }}
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
            onValueChange={(value) => {
              setCustomerName(value);
              if (kind !== "receive") return;
              receiveAmountTouched.current = false;
              applyReceipt(value, amount, false, txnDate, true);
            }}
          />
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
          onChange={(event) => {
            const next = event.target.value;
            if (kind === "receive") {
              receiveAmountTouched.current = true;
              setAmount(next);
              applyReceipt(customerName, next, true);
              return;
            }
            editSource(() => setAmount(next));
          }}
          className={field}
        />
      </label>
      {kind === "receive" && expectedFor(customerName, txnDate) != null ? (
        <p className="-mt-3 text-xs leading-5 text-ink/55">
          Expected {formatINR(expectedFor(customerName, txnDate) ?? 0)} for this date. You can change the amount. Commission follows what you collect.
        </p>
      ) : null}

      <label className="block text-sm font-medium" htmlFor="txnDate">
        Date
        <RequiredMark />
        <input
          id="txnDate"
          name="txnDate"
          type="date"
          required
          value={txnDate}
          onChange={(event) => {
            const next = event.target.value;
            if (kind === "receive") {
              receiveAmountTouched.current = false;
              setTxnDate(next);
              applyReceipt(customerName, amount, false, next);
              return;
            }
            editSource(() => setTxnDate(next));
          }}
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
              value={returnDate}
              onChange={(event) => editSource(() => setReturnDate(event.target.value))}
              className={field}
            />
          </label>
          {commissionField}
          <label className="block text-sm font-medium" htmlFor="returnAmount">
            Return amount
            <input
              id="returnAmount"
              name="returnAmount"
              inputMode="decimal"
              value={returnAmount}
              onChange={(event) => {
                returnTouched.current = true;
                setReturnAmount(event.target.value);
              }}
              className={field}
            />
          </label>
          {chargedDays != null && returnAmount ? (
            <p className="-mt-3 text-xs leading-5 text-ink/55">
              {chargedDays} day{chargedDays === 1 ? "" : "s"} at this commission. You can change the return amount.
            </p>
          ) : null}
        </>
      ) : null}

      {kind !== "expense" ? (
        <>
          {kind === "receive" ? commissionField : null}
          <label className="block text-sm font-medium" htmlFor="paymentMode">
            {kind === "give" ? "Given through" : "Received through"}
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

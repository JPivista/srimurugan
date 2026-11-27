import type { Filter } from "mongodb";
import { ensureSchema, getDb } from "./db";
import {
  commissionFor,
  commissionFromReturn,
  commissionOnReceipt,
  parseMoney,
  parseRate,
  rateForReceipt,
  roundMoney,
  todayISO,
} from "./format";
import type {
  CustomerDue,
  CustomerRollup,
  Dashboard,
  Entry,
  Kind,
  PaymentMode,
} from "./types";

type EntryDoc = {
  _id: number;
  kind: Kind;
  customerName: string | null;
  accountNumber: string | null;
  mobile: string | null;
  amount: number;
  commissionPerLakh: number | null;
  commissionAmount: number;
  paymentMode: PaymentMode | null;
  reason: string | null;
  notes: string | null;
  txnDate: string;
  returnDate: string | null;
  returnAmount: number | null;
  receivedFrom: string | null;
};

type Totals = {
  given: number;
  received: number;
  cashGiven: number;
  cashReceived: number;
  expenses: number;
  profit: number;
};

const bankMode = { $ne: ["$paymentMode", "cash"] };
const cashMode = { $eq: ["$paymentMode", "cash"] };

function mapEntry(doc: EntryDoc): Entry {
  return {
    id: doc._id,
    kind: doc.kind,
    customerName: doc.customerName,
    accountNumber: doc.accountNumber,
    mobile: doc.mobile,
    amount: Number(doc.amount),
    commissionPerLakh:
      doc.commissionPerLakh == null ? null : Number(doc.commissionPerLakh),
    commissionAmount: Number(doc.commissionAmount),
    paymentMode: doc.paymentMode,
    reason: doc.reason,
    notes: doc.notes,
    txnDate: String(doc.txnDate).slice(0, 10),
    returnDate: doc.returnDate ? String(doc.returnDate).slice(0, 10) : null,
    returnAmount: doc.returnAmount == null ? null : Number(doc.returnAmount),
    receivedFrom: doc.receivedFrom,
  };
}

function cleanText(value: string, max: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

async function entries() {
  await ensureSchema();
  const db = await getDb();
  return db.collection<EntryDoc>("entries");
}

async function nextEntryId() {
  const db = await getDb();
  const counter = await db.collection<{ _id: string; seq: number }>("counters").findOneAndUpdate(
    { _id: "entries" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  const seq = counter?.seq;
  if (!seq) throw new Error("Could not assign an entry number.");
  return seq;
}

const DEFAULT_CASH = 27500;

function readRupees(raw: string, label: string) {
  const cleaned = raw.replace(/[₹,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new Error(`Enter the ${label} in rupees.`);
  }
  const amount = Number(cleaned);
  if (amount > 999999999999) {
    throw new Error(`That ${label} is too large.`);
  }
  return amount;
}

export async function getOpeningBalances() {
  await ensureSchema();
  const db = await getDb();
  const settings = db.collection<{ _id: string; openingBalance: number; openingCash?: number }>(
    "settings",
  );
  const row = await settings.findOne({ _id: "opening" });
  const openingBalance = Number(row?.openingBalance ?? 0);
  if (row?.openingCash == null) {
    await settings.updateOne(
      { _id: "opening" },
      { $set: { openingCash: DEFAULT_CASH, updatedAt: new Date() } },
      { upsert: true },
    );
  }
  return {
    openingBalance,
    openingCash: row?.openingCash == null ? DEFAULT_CASH : Number(row.openingCash),
  };
}

export async function saveOpeningBalances(bankRaw: string, cashRaw: string) {
  const openingBalance = readRupees(bankRaw, "opening bank balance");
  const openingCash = readRupees(cashRaw, "opening cash");
  await ensureSchema();
  const db = await getDb();
  await db.collection("settings").updateOne(
    { _id: "opening" },
    { $set: { openingBalance, openingCash, updatedAt: new Date() } },
    { upsert: true },
  );
}

export async function getEntry(id: number) {
  const row = await (await entries()).findOne({ _id: id });
  return row ? mapEntry(row) : null;
}

export async function customerDues(excludeId?: number): Promise<CustomerDue[]> {
  const rows = await (await entries())
    .find({
      kind: { $in: ["give", "receive"] },
      customerName: { $nin: [null, ""] },
    })
    .sort({ txnDate: 1, _id: 1 })
    .toArray();
  const map = new Map<string, CustomerDue>();
  for (const row of rows) {
    if (excludeId && row._id === excludeId) continue;
    const entry = mapEntry(row);
    const key = (entry.customerName || "").toLowerCase();
    if (!key) continue;
    const current = map.get(key) ?? {
      name: entry.customerName || "",
      principal: 0,
      expected: 0,
      loans: [],
    };
    current.name = entry.customerName || current.name;
    if (entry.kind === "give") {
      const planned =
        entry.returnAmount != null && entry.returnAmount > 0
          ? entry.returnAmount
          : entry.amount + entry.commissionAmount;
      current.principal += entry.amount;
      current.expected += planned;
      current.loans.push({
        id: entry.id,
        principal: entry.amount,
        original: entry.amount,
        giveDate: entry.txnDate,
        returnDate: entry.returnDate,
        perLakh: entry.commissionPerLakh,
        planned,
      });
    }
    if (entry.kind === "receive") {
      const principalBack = Math.min(
        entry.amount,
        Math.max(0, entry.amount - entry.commissionAmount),
      );
      let left = principalBack;
      for (const loan of current.loans) {
        if (left <= 0) break;
        const take = Math.min(loan.principal, left);
        loan.principal = roundMoney(loan.principal - take);
        left = roundMoney(left - take);
      }
      current.loans = current.loans.filter((loan) => loan.principal > 0);
      current.principal = Math.max(0, current.principal - principalBack);
      current.expected = Math.max(0, current.expected - entry.amount);
    }
    map.set(key, current);
  }
  return [...map.values()].filter((item) => item.principal > 0 || item.expected > 0);
}

export async function pendingGiveIds() {
  const dues = await customerDues();
  return dues.flatMap((due) =>
    due.loans.filter((loan) => loan.principal > 0).map((loan) => loan.id),
  );
}

export async function customerNames() {
  const names = await (await entries()).distinct("customerName", {
    customerName: { $nin: [null, ""] },
  });
  return names
    .filter((name): name is string => Boolean(name))
    .sort((a, b) => a.localeCompare(b));
}

type ListFilters = {
  kind?: string;
  q?: string;
  from?: string;
  to?: string;
  limit?: number;
};

function isKind(value: string | undefined): value is Kind {
  return value === "give" || value === "receive" || value === "expense";
}

function isDate(value: string | undefined) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export async function listEntries(filters: ListFilters = {}) {
  const filter: Filter<EntryDoc> = {};
  if (isKind(filters.kind)) filter.kind = filters.kind;
  if (filters.q?.trim()) {
    const pattern = filters.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const like = new RegExp(pattern, "i");
    filter.$or = [
      { customerName: like },
      { receivedFrom: like },
      { reason: like },
      { accountNumber: like },
      { notes: like },
      { mobile: like },
    ];
  }
  if (isDate(filters.from) || isDate(filters.to)) {
    filter.txnDate = {};
    if (isDate(filters.from)) filter.txnDate.$gte = filters.from;
    if (isDate(filters.to)) filter.txnDate.$lte = filters.to;
  }
  const limit = Math.min(Math.max(filters.limit ?? 300, 1), 500);
  const rows = await (await entries())
    .find(filter)
    .sort({ txnDate: -1, _id: -1 })
    .limit(limit)
    .toArray();
  return rows.map(mapEntry);
}

async function sumTotals(match: Filter<EntryDoc> = {}): Promise<Totals> {
  const [row] = await (await entries())
    .aggregate<Totals>([
      { $match: match },
      {
        $group: {
          _id: null,
          given: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$kind", "give"] }, bankMode] }, "$amount", 0],
            },
          },
          received: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$kind", "receive"] }, bankMode] }, "$amount", 0],
            },
          },
          cashGiven: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$kind", "give"] }, cashMode] }, "$amount", 0],
            },
          },
          cashReceived: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$kind", "receive"] }, cashMode] }, "$amount", 0],
            },
          },
          expenses: { $sum: { $cond: [{ $eq: ["$kind", "expense"] }, "$amount", 0] } },
          profit: {
            $sum: { $cond: [{ $eq: ["$kind", "receive"] }, "$commissionAmount", 0] },
          },
        },
      },
    ])
    .toArray();
  return {
    given: Number(row?.given ?? 0),
    received: Number(row?.received ?? 0),
    cashGiven: Number(row?.cashGiven ?? 0),
    cashReceived: Number(row?.cashReceived ?? 0),
    expenses: Number(row?.expenses ?? 0),
    profit: Number(row?.profit ?? 0),
  };
}

export async function getDashboard(): Promise<Dashboard> {
  const today = todayISO();
  const [openings, totals, todayTotals, recent] = await Promise.all([
    getOpeningBalances(),
    sumTotals(),
    sumTotals({ txnDate: today }),
    listEntries({ limit: 6 }),
  ]);

  return {
    openingBalance: openings.openingBalance,
    given: totals.given,
    received: totals.received,
    expenses: totals.expenses,
    profit: totals.profit,
    bankBalance: openings.openingBalance - totals.given + totals.received - totals.expenses,
    openingCash: openings.openingCash,
    cashGiven: totals.cashGiven,
    cashReceived: totals.cashReceived,
    cashInHand: openings.openingCash - totals.cashGiven + totals.cashReceived,
    withCustomers:
      totals.given +
      totals.cashGiven -
      (totals.received + totals.cashReceived) +
      totals.profit,
    todayGiven: todayTotals.given + todayTotals.cashGiven,
    todayReceived: todayTotals.received + todayTotals.cashReceived,
    todayExpenses: todayTotals.expenses,
    todayProfit: todayTotals.profit,
    recent,
  };
}

export async function customerRollups() {
  const rows = await (await entries())
    .find({
      kind: { $in: ["give", "receive"] },
      customerName: { $nin: [null, ""] },
    })
    .sort({ txnDate: 1, _id: 1 })
    .toArray();
  const map = new Map<string, CustomerRollup>();
  for (const row of rows) {
    const entry = mapEntry(row);
    const key = (entry.customerName || "").toLowerCase();
    if (!key) continue;
    const current = map.get(key) ?? {
      name: entry.customerName || "",
      accountNumber: null,
      mobile: null,
      given: 0,
      received: 0,
      outstanding: 0,
      commissionEarned: 0,
    };
    current.name = entry.customerName || current.name;
    if (entry.accountNumber) current.accountNumber = entry.accountNumber;
    if (entry.mobile) current.mobile = entry.mobile;
    if (entry.kind === "give") current.given += entry.amount;
    if (entry.kind === "receive") {
      current.received += entry.amount;
      current.commissionEarned += entry.commissionAmount;
    }
    current.outstanding = Math.max(
      0,
      current.given - current.received + current.commissionEarned,
    );
    map.set(key, current);
  }
  return [...map.values()].sort(
    (a, b) => b.outstanding - a.outstanding || a.name.localeCompare(b.name),
  );
}

export type Draft = {
  id?: number;
  kind: Kind;
  customerName: string;
  accountNumber: string;
  mobile: string;
  amount: number;
  commissionPerLakh: number | null;
  commissionAmount: number;
  paymentMode: PaymentMode | null;
  reason: string | null;
  notes: string | null;
  txnDate: string;
  returnDate: string | null;
  returnAmount: number | null;
  receivedFrom: string | null;
};

export function draftFromForm(formData: FormData): Draft {
  const kindRaw = String(formData.get("kind") || "");
  if (!isKind(kindRaw)) throw new Error("Choose give, receive, or expense.");
  const txnDate = String(formData.get("txnDate") || "");
  if (!isDate(txnDate)) throw new Error("Choose a valid date.");
  const amount = parseMoney(String(formData.get("amount") || ""));
  if (amount == null) throw new Error("Enter an amount in rupees.");

  const idRaw = String(formData.get("id") || "");
  const id = idRaw ? Number(idRaw) : undefined;
  if (idRaw && (!Number.isInteger(id) || (id ?? 0) <= 0)) {
    throw new Error("That entry could not be updated.");
  }

  const notesRaw = cleanText(String(formData.get("notes") || ""), 500);

  if (kindRaw === "expense") {
    const reason = cleanText(String(formData.get("reason") || ""), 255);
    if (!reason) throw new Error("Enter a reason for the expense.");
    return {
      id,
      kind: "expense",
      customerName: "",
      accountNumber: "",
      mobile: "",
      amount,
      commissionPerLakh: null,
      commissionAmount: 0,
      paymentMode: null,
      reason,
      notes: null,
      txnDate,
      returnDate: null,
      returnAmount: null,
      receivedFrom: null,
    };
  }

  const customerName = cleanText(String(formData.get("customerName") || ""), 120);
  if (customerName.length < 2) throw new Error("Customer name is required.");
  const rateRaw = String(formData.get("commissionPerLakh") || "").trim();
  const rate = rateRaw ? parseRate(rateRaw) : null;
  if (rateRaw && rate == null) throw new Error("Enter commission per lakh as a number, or leave it blank.");
  const modeRaw = String(formData.get("paymentMode") || "bank");
  const paymentMode: PaymentMode =
    modeRaw === "bank" || modeRaw === "upi" || modeRaw === "cash" ? modeRaw : "bank";
  const planned = optionalReturn(formData, kindRaw);
  return {
    id,
    kind: kindRaw,
    customerName,
    accountNumber: "",
    mobile: "",
    amount,
    commissionPerLakh: rate,
    commissionAmount:
      kindRaw === "give" && planned.returnAmount != null
        ? Math.max(0, commissionFromReturn(amount, planned.returnAmount))
        : rate == null
          ? 0
          : commissionFor(amount, rate),
    paymentMode,
    reason: null,
    notes: notesRaw || null,
    txnDate,
    returnDate: planned.returnDate,
    returnAmount: planned.returnAmount,
    receivedFrom: null,
  };
}

function optionalReturn(formData: FormData, kind: Kind) {
  if (kind !== "give") return { returnDate: null, returnAmount: null };
  const dateRaw = String(formData.get("returnDate") || "").trim();
  const amountRaw = String(formData.get("returnAmount") || "").trim();
  if (dateRaw && !isDate(dateRaw)) {
    throw new Error("Enter a valid return date, or leave it blank.");
  }
  const returnAmount = amountRaw ? parseMoney(amountRaw) : null;
  if (amountRaw && returnAmount == null) {
    throw new Error("Enter the return amount in rupees, or leave it blank.");
  }
  return { returnDate: dateRaw || null, returnAmount };
}

function entryFields(draft: Draft): Omit<EntryDoc, "_id"> {
  return {
    kind: draft.kind,
    customerName: draft.customerName || null,
    accountNumber: draft.accountNumber || null,
    mobile: draft.mobile || null,
    amount: draft.amount,
    commissionPerLakh: draft.commissionPerLakh,
    commissionAmount: draft.commissionAmount,
    paymentMode: draft.paymentMode,
    reason: draft.reason,
    notes: draft.notes,
    txnDate: draft.txnDate,
    returnDate: draft.returnDate,
    returnAmount: draft.returnAmount,
    receivedFrom: draft.receivedFrom,
  };
}

export async function saveEntry(draft: Draft) {
  if (draft.kind === "receive") {
    const dues = await customerDues(draft.id);
    const due = dues.find(
      (item) => item.name.toLowerCase() === draft.customerName.toLowerCase(),
    );
    const principal = due?.principal ?? 0;
    draft.commissionAmount = commissionOnReceipt(draft.amount, principal);
    draft.commissionPerLakh = rateForReceipt(draft.amount, principal);
    draft.receivedFrom = null;
  }
  const col = await entries();
  if (draft.id) {
    const result = await col.updateOne(
      { _id: draft.id },
      { $set: entryFields(draft) },
    );
    if (result.matchedCount === 0) throw new Error("That entry is no longer in the ledger.");
    return;
  }

  const id = await nextEntryId();
  await col.insertOne({ _id: id, ...entryFields(draft) });
}

export async function deleteEntry(id: number) {
  await (await entries()).deleteOne({ _id: id });
}

export function blankEntry(partial?: Partial<Entry>) {
  return {
    id: partial?.id,
    kind: partial?.kind ?? "give",
    customerName: partial?.customerName ?? "",
    accountNumber: partial?.accountNumber ?? "",
    mobile: partial?.mobile ?? "",
    amount: partial?.amount ? String(partial.amount) : "",
    commissionPerLakh:
      partial?.commissionPerLakh != null ? String(partial.commissionPerLakh) : "300",
    paymentMode: partial?.paymentMode ?? "bank",
    reason: partial?.reason ?? "",
    notes: partial?.notes ?? "",
    txnDate: partial?.txnDate ?? todayISO(),
    returnDate: partial?.returnDate ?? "",
    returnAmount: partial?.returnAmount != null ? String(partial.returnAmount) : "",
    receivedFrom: partial?.receivedFrom ?? "",
  };
}

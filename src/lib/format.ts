export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function formatINR(value: number) {
  const amount = roundMoney(value);
  const whole = Number.isInteger(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function commissionFor(amount: number, perLakh: number) {
  return roundMoney((amount / 100000) * perLakh);
}

function isoUtc(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;
  return Date.UTC(year, month - 1, day);
}

/** Inclusive days from the give date through the return date. The same day counts as 1. */
export function daysCharged(fromISO: string, toISO: string) {
  const from = isoUtc(fromISO);
  const to = isoUtc(toISO);
  if (from == null || to == null || to < from) return null;
  return Math.round((to - from) / 86_400_000) + 1;
}

export function suggestedReturn(amount: number, perLakh: number, fromISO: string, toISO: string) {
  const days = daysCharged(fromISO, toISO);
  if (days == null) return null;
  return roundMoney(amount + commissionFor(amount, perLakh) * days);
}

export function commissionFromReturn(given: number, returned: number) {
  return roundMoney(returned - given);
}

export function plannedReceipt(
  loans: { principal: number; original: number; planned: number }[],
) {
  if (loans.length === 0) return null;
  let total = 0;
  let any = false;
  for (const loan of loans) {
    if (loan.principal <= 0) continue;
    any = true;
    const share = loan.original > 0 ? loan.principal / loan.original : 0;
    total += loan.planned * share;
  }
  if (!any) return null;
  const amount = roundMoney(total);
  return amount > 0 ? amount : null;
}

export function expectedReceipt(
  loans: { principal: number; original: number; giveDate: string; perLakh: number | null; planned: number }[],
  receiveDate: string,
) {
  if (loans.length === 0) return null;
  let total = 0;
  for (const loan of loans) {
    if (loan.principal <= 0) continue;
    const share = loan.original > 0 ? loan.principal / loan.original : 0;
    const days = loan.perLakh == null ? null : daysCharged(loan.giveDate, receiveDate);
    if (days == null || loan.perLakh == null) {
      total += loan.planned * share;
      continue;
    }
    total += loan.principal + commissionFor(loan.principal, loan.perLakh) * days;
  }
  const amount = roundMoney(total);
  return amount > 0 ? amount : null;
}

export function commissionOnReceipt(collected: number, principal: number) {
  return roundMoney(Math.max(0, collected - principal));
}

export function rateForReceipt(collected: number, principal: number) {
  const commission = commissionOnReceipt(collected, principal);
  if (principal <= 0) return 0;
  return roundMoney(commission / (principal / 100000));
}

export function lakhHint(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) return "";
  const lakhs = roundMoney(amount / 100000);
  const label = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(lakhs);
  return `${label} lakh${lakhs === 1 ? "" : "s"}`;
}

export function parseMoney(raw: string) {
  const cleaned = raw.replace(/[₹,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value <= 0 || value > 999999999999) return null;
  return roundMoney(value);
}

export function parseRate(raw: string) {
  const cleaned = raw.replace(/[₹,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0 || value > 1000000) return null;
  return roundMoney(value);
}

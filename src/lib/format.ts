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

export function commissionFromReturn(given: number, returned: number) {
  return roundMoney(returned - given);
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

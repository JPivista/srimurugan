export type Kind = "give" | "receive" | "expense";
export type PaymentMode = "cash" | "bank" | "upi";

export type Entry = {
  id: number;
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

export type Dashboard = {
  openingBalance: number;
  given: number;
  received: number;
  expenses: number;
  profit: number;
  bankBalance: number;
  withCustomers: number;
  todayGiven: number;
  todayReceived: number;
  todayExpenses: number;
  todayProfit: number;
  recent: Entry[];
};

export type OpenLoan = {
  principal: number;
  original: number;
  giveDate: string;
  returnDate: string | null;
  perLakh: number | null;
  planned: number;
};

export type CustomerDue = {
  name: string;
  principal: number;
  expected: number;
  loans: OpenLoan[];
};

export type CustomerRollup = {
  name: string;
  accountNumber: string | null;
  mobile: string | null;
  given: number;
  received: number;
  outstanding: number;
  commissionEarned: number;
};

export type EntryInput = {
  id?: number;
  kind: Kind;
  customerName: string;
  accountNumber: string;
  mobile: string;
  amount: string;
  commissionPerLakh: string;
  paymentMode: PaymentMode;
  reason: string;
  notes: string;
  txnDate: string;
  returnDate: string;
  returnAmount: string;
  receivedFrom: string;
};

export type ActionState = {
  error?: string;
  ok?: boolean;
};

export type DbFailure = {
  message: string;
};

export type ChitRow = {
  month: number;
  installment: number;
  prize: number;
};

export type ChitScheme = {
  id: string;
  value: number;
  members: number;
  months: number;
  installment: number;
  note: string;
  rows: ChitRow[];
};

function schedule(
  installment: number,
  months: number,
  firstPrize: number,
  step: number,
  lastPrize?: number,
): ChitRow[] {
  return Array.from({ length: months - 1 }, (_, index) => {
    const month = index + 2;
    const prize =
      month === months && lastPrize != null ? lastPrize : firstPrize + (month - 2) * step;
    return { month, installment, prize };
  });
}

export const chitSchemes: ChitScheme[] = [
  {
    id: "1l-20",
    value: 100000,
    members: 20,
    months: 20,
    installment: 5000,
    note: "The prize amount is settled between the 1st and the 10th of each month.",
    rows: schedule(5000, 20, 83000, 1500),
  },
  {
    id: "1l-10",
    value: 100000,
    members: 10,
    months: 10,
    installment: 10000,
    note: "The prize amount is handed over on the 11th of each month.",
    rows: schedule(10000, 10, 81000, 3500, 110000),
  },
  {
    id: "2l-20",
    value: 200000,
    members: 20,
    months: 20,
    installment: 10000,
    note: "Full 20-month prize schedule.",
    rows: schedule(10000, 20, 172500, 2500, 220000),
  },
  {
    id: "3l-20",
    value: 300000,
    members: 20,
    months: 20,
    installment: 15000,
    note: "Full 20-month prize schedule.",
    rows: schedule(15000, 20, 258750, 3750, 330000),
  },
  {
    id: "4l-20",
    value: 400000,
    members: 20,
    months: 20,
    installment: 20000,
    note: "Full 20-month prize schedule.",
    rows: schedule(20000, 20, 345000, 5000, 440000),
  },
  {
    id: "5l-20",
    value: 500000,
    members: 20,
    months: 20,
    installment: 25000,
    note: "Full 20-month prize schedule.",
    rows: schedule(25000, 20, 431250, 6250, 550000),
  },
];

export const services = [
  {
    title: "Gold loan renewal and recovery",
    text: "Help with renewing a gold loan and with recovery follow-up.",
  },
  {
    title: "Short-term personal finance",
    text: "Short-term funds arranged for a known customer, with the amount and return recorded.",
  },
  {
    title: "Vehicle document finance",
    text: "Finance arranged against vehicle documents.",
  },
  {
    title: "Daily collection",
    text: "Daily collection for running accounts.",
  },
  {
    title: "Credit card bill payment",
    text: "Assistance paying a credit card bill.",
  },
  {
    title: "Chit fund services",
    text: "Six chit schemes, from ₹1,00,000 to ₹5,00,000, with a fixed monthly installment and a published prize for each month.",
  },
];

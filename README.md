# Sree Murugan Financials

Mobile-friendly daily fund ledger. Books are stored in the `srimurugan` MongoDB database.

## How money moves

- **Give** deducts the amount from the bank. Commission is saved on the entry (default ₹250 per lakh, editable) and is not profit yet.
- **Receive** adds the amount back to the bank and adds the commission to profit. Example: ₹3,00,000 at ₹300 per lakh puts ₹3,00,000 in the bank and ₹900 in profit.
- **Expense** asks for a reason and an amount, then deducts that amount from the bank.

Set the opening bank balance on the Bank screen first.

## Run

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set `MONGODB_URI`. Open http://localhost:3000.

On Vercel, add `MONGODB_URI` and `MONGODB_DB` in the project environment variables. Atlas must allow network access from `0.0.0.0/0` so the hosted app can reach the cluster. Collections and indexes are created on first use.

# Sree Murugan Financials

Mobile-friendly daily fund ledger. Books are stored in the `srimurugan` MongoDB database.

## How money moves

- **Give** deducts the amount from the bank. Commission is saved on the entry (default ₹300 per lakh per day, editable) and is not profit yet.
- **Receive** adds the amount back to the bank and adds the commission to profit. Example: ₹3,00,000 at ₹300 per lakh puts ₹3,00,000 in the bank and ₹900 in profit.
- **Expense** asks for a reason and an amount, then deducts that amount from the bank.

Set the opening bank balance on the Bank screen first.

## Run

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set `MONGODB_URI`. Also set `APP_USERNAME`, `APP_PASSWORD`, and `SESSION_SECRET`. The public site stays open. The office books at `/app` ask for that login. Open http://localhost:3000.

On Vercel, add `MONGODB_URI`, `MONGODB_DB`, `APP_USERNAME`, `APP_PASSWORD`, and `SESSION_SECRET` in the project environment variables. Use the same `SESSION_SECRET` you use locally if you want existing sign-ins to keep working after deploy. Atlas must allow network access from `0.0.0.0/0` so the hosted app can reach the cluster. Collections and indexes are created on first use.

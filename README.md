# BabySteps - Budget Micro

A minimal budgeting and debt-snowball tracker built as a finished, portfolio-ready project.

This app focuses on the core personal-finance flow: add debts -> record payments -> track progress, without over-engineering.

---

## What it does

- Add and manage debts (credit cards, loans, CCJs)
- Record payments safely with validation
- Automatically calculate remaining balances
- Sort debts using the debt snowball method
- Show clear progress and totals

No accounts. No bank connections. No noise.

---

## Design principles

- Finished over fancy - small scope, fully complete
- Derived data - balances are calculated from payments, not duplicated
- Server-first - backend logic lives in API routes
- Simple UX - clear states, no dead ends

---

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Drizzle ORM
- Neon (Postgres)
- shadcn/ui
- Tailwind CSS

---

## Core features

- Debt CRUD (create, update, delete)
- Payment tracking with overpayment protection
- Snowball ordering by remaining balance
- Progress summary (total debt, total paid, percent complete)
- Clean empty states and inline validation

---

## Out of scope (by design)

These features are intentionally excluded from the MVP:

- User authentication
- Bank integrations
- Monthly budgeting
- Charts and analytics
- AI recommendations
- Import/export

The goal is clarity and completion, not feature count.

---

## Running locally

```bash
# install dependencies
npm install

# run dev server
npm run dev
```

Set the following environment variable:

```
DATABASE_URL=your_neon_postgres_url
```

---

## Screenshots

Captured and saved in `./screenshots`:

- `welcome.png`
- `dashboard-empty.png`
- `add-debt.png`
- `dashboard-with-debts.png`
- `add-payment.png`

Embed preview:

```
![Welcome](./screenshots/welcome.png)
![Dashboard empty](./screenshots/dashboard-empty.png)
![Add debt](./screenshots/add-debt.png)
![Dashboard](./screenshots/dashboard-with-debts.png)
![Add payment](./screenshots/add-payment.png)
```

---

## Known limitations

- Single-user only
- No authentication
- No historical analytics
- Optimised for clarity, not scale

---

## Why this project exists

This project was built to demonstrate:

- end-to-end product delivery
- clean backend modelling
- safe validation and data handling
- a complete, shippable feature set

It is intentionally small — and intentionally finished.

---

## Final checklist

- README exists and reads calmly
- `screenshots` folder exists
- App runs cleanly
- No TODOs in the UI
- Errors are human-readable
- No screen feels dead

When all are checked: stop. Do not add features. This project is complete.

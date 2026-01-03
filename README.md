# BabySteps Budget

Production-focused budgeting, UC-aware income, and debt snowball tracker. Built to be shippable, not a demo.

Flow: add incomes and expenses → capture debts → record payments → see cashflow, UC impact, and payoff progress. Opt-in email reminders keep people on track without judgement.

---

## What it does

- Debts: expanded UK-friendly types, min payment and frequency, due-day scheduling that moves weekends/bank holidays to the next working day, overpayment guard, snowball ordering.
- Payments: track totals, remaining balance, and monthly paid status; forms validated server-side.
- Income: hourly/net monthly/gross yearly/UC; taper calculation using disregard and taper rate; categories, frequency, and payment day metadata.
- Expenses: richer categories, paid-by-UC flag, frequency + payment day; monthly totals surfaced to dashboards.
- UC: hard-coded first-£411 disregard and 55% taper (configurable via env) and ignores UC income when tapering.
- Notifications: optional user toggle; Resend/Mailpit email reminders for upcoming payments (next 3 days) and progress; cron-secured endpoint.
- Auth: better-auth email flows (sign-up, sign-in, verification, password reset), session-protected API routes.
- UX: light/dark theming, charts, empty/loading/error states, mobile-friendly navigation.

---

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Drizzle ORM (Postgres; tested with Neon)
- better-auth + mailer (Resend in prod, Mailpit locally)
- shadcn/ui + Tailwind CSS + Recharts

---

## Run it locally

```bash
# install dependencies
npm install
# or bun install

# start dev server
npm run dev
# lint / test / build
npm run lint
npm test
npm run build

# seed demo data
npm run seed:test
```

---

## Environment variables

```
DATABASE_URL=postgres_connection_string

# Auth
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_random_secret

# Mail (local Mailpit)
MAILPIT_HOST=127.0.0.1
MAILPIT_PORT=1025
MAIL_FROM="BabySteps <no-reply@babysteps.test>"

# Mail (production via Resend)
RESEND_API_KEY=your_resend_key
RESEND_FROM="BabySteps <no-reply@yourdomain.com>"

# UC taper config (defaults shown)
UC_BASE_MONTHLY=0
UC_TAPER_DISREGARD=411
UC_TAPER_RATE=0.55

# Cron
CRON_SECRET=long_random_token
```

---

## Cron reminders

- Endpoint: `POST /api/cron/notify` with header `Authorization: Bearer ${CRON_SECRET}`.
- Health check: `GET /api/cron/notify` with the same header.
- Schedule (example for Vercel Cron): daily, early morning.
- Behavior: scans users who opted in, finds debts due in next 3 days (after weekend/bank-holiday adjustment), and emails reminders plus progress.

---

## Testing

- Unit tests: `npm test` (tsx runner)
- Lint: `npm run lint`
- Build/type-check: `npm run build`

---

## Screenshots

Stored in `./screenshots`:

- welcome.png
- dashboard-empty.png
- add-debt.png
- dashboard-with-debts.png
- add-payment.png

Embed:

```
![Welcome](./screenshots/welcome.png)
![Dashboard empty](./screenshots/dashboard-empty.png)
![Add debt](./screenshots/add-debt.png)
![Dashboard](./screenshots/dashboard-with-debts.png)
![Add payment](./screenshots/add-payment.png)
```

---

## Known limitations

- No social login yet (email flows only)
- No external bank connections or imports
- Monitoring/alerting currently console-only (add Sentry/Logtail/etc. for production)
- Analytics/graphs are minimal by design

---

## Production checklist

- [ ] Database migrated and backups enabled
- [ ] Env vars set (DB, auth, mail, UC taper, CRON_SECRET)
- [ ] Resend verified sender or Mailpit running locally
- [ ] Cron job configured to call `/api/cron/notify` with `Bearer CRON_SECRET`
- [ ] HTTPS enforced and secure cookies enabled in hosting
- [ ] Monitoring/alerting pointed at a log sink
- [ ] Lint/tests/build passing

When the list is checked, ship it.

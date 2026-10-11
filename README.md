# MarketLab

**Learn the market. Find your edge.** A virtual-money market learning laboratory built with Next.js, React, TypeScript, Motion and Lightweight Charts.

## Current release

This repository provides a **working local educational demonstration**, not the complete production specification. Prices and news scenarios are explicitly fictional. Instrument identities identify real companies; no displayed quote is real-time or historical exchange data. No money can be deposited, paid, withdrawn or redeemed.

Implemented workflows include persistent local registration/login, market search, currency-separated wallets, market and limit orders, cash/share reservations, order cancellation, isolated timed sessions, frozen session news, refresh restoration, reports, observed equity curves, portfolios, watchlists, journals, ten lessons and quizzes, achievements, fictional IPO allotment, classroom membership and learning rankings, notifications, and administrator funding and session-rule configuration with an audit trail.

**Supabase production auth/database, licensed market/news feeds, LLM integration, Web Push, shared classroom competitions, advanced chart indicators, and the remaining production features are not completed.** The Supabase migration is a schema foundation and is not the active backend. See [implementation status](docs/IMPLEMENTATION.md) for exact scope and [deployment](docs/DEPLOYMENT.md) before hosting.

## Run locally

Node.js **24** is required (the local backend uses `node:sqlite`).

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open the application on port 3000. “Enter the demo lab” creates an isolated student account with virtual funds; registration lets you return with an email/password. Demo data persists in `.data/marketlab.sqlite`, including after server restarts. Back up this directory before resetting it. Guest/demo accounts remain until the database is removed; this is not intended as a public multi-tenant deployment.

No external credentials are needed. Each practice account begins with 100,000 virtual currency units. Accounts are currency separated; there is no implicit FX conversion. Optional administrator provisioning uses `MARKETLAB_ADMIN_EMAIL` and `MARKETLAB_ADMIN_PASSWORD` in a private environment file. There is no default admin password. Provisioning creates an admin only if that email is not registered; it never elevates an existing student. Changing this environment password does not reset an existing password.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

For an existing system Chromium: `PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`. Browser tests launch an isolated test server on port 3100 and a unique temporary database. Stop your development server first: Next.js prevents multiple dev processes in the same checkout.

## Simulation model

Money is stored as integer minor units with safe-integer validation. The demo uses two internal decimal places for all currencies, including JPY. Buy cost basis includes fees. Sales release weighted-average cost basis; fees are rounded up to a minor unit. Administrative adjustments change net funding and are excluded from investment returns. Fictional IPO assets remain marked at issue cost.

Market orders fill fully at the current fictional observation. Limits reserve funds or shares, and fill only when an observed price satisfies the limit. There is no partial fill, bid/ask spread, liquidity model, slippage, short selling, leverage, dividend processing or corporate-action simulation. This model is unsuitable for evaluating real execution performance.

Sessions last **15–45 wall-clock minutes**, in five-minute increments. A fictional scenario reveals one observation each minute; chart dates are illustrative period labels, not an actual historical replay. The starting allocation is fixed and separate from the practice wallet. The news ID set is frozen at creation. Orders and countdown expiry remain authoritative on the server. Expiry catches up on the next authenticated server request, cancels remaining pending orders and marks open positions rather than liquidating. Replay observations missed during disconnects are processed chronologically; no fill occurs against an observation preceding submission. A dedicated background finalizer is required for unattended production expiry.

Session reports preserve final equity and fees. Charts show actual observed demo equity, not invented returns. Drawdown is sampled and cannot describe intraperiod extremes. Reflection text is an educational template, not an AI analysis.

## Structure

```
src/app/              Next.js shell, styles and authenticated API routes
src/components/       Workspace UI, candlestick and equity charts
src/lib/              Financial engine, metrics, demo market data, persistence
supabase/             Production schema foundation and directory seed
 tests/               Financial unit tests and browser/API workflows
 docs/                Architecture, status, provider and deployment notes
.github/workflows/    Lint, typecheck, tests, build and dependency audit
```

## Security boundaries

The demo uses scrypt password hashing, opaque random sessions stored hashed on the server, HttpOnly/SameSite cookies, request-origin checks, strict Zod input validation, process-local request limits, prepared SQL statements, SQLite immediate transactions and server-side admin checks. Student requests cannot assign roles. Wallet changes append ledger records; no mutation endpoint permits editing old entries. Private account state is never exposed in classroom rankings. SQLite state is a demo-oriented JSON aggregate, not the normalized production ledger.

For production, replace local persistence and authentication, use distributed rate limiting and background processing, verify Supabase RLS and financial RPCs, configure a trusted `MARKETLAB_APP_ORIGIN`, and complete a security review. Supabase service-role keys must never be sent to the browser.

## GitHub and deployment

Changes are prepared in the existing Git checkout. Nothing is pushed or deployed automatically.

```sh
git status --short
git add README.md .gitignore .env.example .github AGENTS.md docs src supabase tests package.json package-lock.json tsconfig.json next-env.d.ts eslint.config.mjs next.config.ts playwright.config.ts .nvmrc CONTRIBUTING.md
git commit -m "Build MarketLab educational trading demo"
git push origin HEAD:main
```

Review the diff and confirm the target branch before pushing. Never add `.env.local`, `.data`, test traces or real credentials. The existing repository already has an origin; do not reinitialize or replace it. Follow [deployment instructions](docs/DEPLOYMENT.md). **The SQLite demo must not be deployed to Vercel**, whose ephemeral and distributed filesystem cannot provide correct persistent accounting.

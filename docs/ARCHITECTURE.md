# Architecture and boundaries

MarketLab is a Next.js application rather than a collection of microservices. The root workspace currently uses client view navigation. Public information and authentication are dialogs; dedicated per-page URLs and route-level server redirects remain work to complete.

The financial engine is pure domain logic with explicit timestamps. The API validates inputs, derives identity from the HttpOnly token, checks roles on the server, and applies mutations inside one SQLite immediate transaction. Each account state is an atomic JSON aggregate. Instrument identifiers include exchange MIC codes so overlapping symbols remain distinct. Money uses integer minor units; rational currency conversion is available as a tested utility but no FX trading flow is enabled.

Session expiry is stored on the server; UI countdowns cannot extend it. Price observations and pending-order catch-up never run past expiry. State reads finalize expired sessions. Session reports are retained and idempotent. Session news IDs are frozen against the immutable demonstration fixture. A production news adapter must freeze content, timestamps and source attribution, not only mutable IDs.

The production PostgreSQL schema normalizes wallets, sessions, instruments, orders, lots, news, learning, classrooms and audits. Default-deny RLS permits narrowly scoped reads and selected non-financial writes. The funding RPC locks the account and appends ledger/audit entries in one transaction. **The schema is tested in local PGlite with an Auth stub, but has not been applied or verified against a hosted Supabase instance; production order/session RPCs and repository adapters remain incomplete.** It is not a drop-in switch for SQLite.

Future production layers should expose `MarketProvider`, `NewsProvider`, `CalendarProvider`, `FxProvider`, and `ExplanationProvider` contracts. Every quote needs mode, source, timestamp, currency and availability. Historical endpoints must enforce session cutoff server-side, including cached responses and fundamentals. An LLM may explain authorized data but cannot invoke funding, order, or privilege mutations.

For production deployment, use Supabase Auth with SSR cookie refresh, authenticated PostgreSQL RPCs for financial writes, account-scoped RLS, licensed provider adapters and a durable job scheduler. Treat finalization, price ingestion and notification delivery as retryable idempotent jobs. No dependency on a running Next.js request should be required for expiry.

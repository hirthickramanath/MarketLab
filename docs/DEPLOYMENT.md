# Deployment

## Local and persistent-server demo

Use Node 24, `npm ci`, then `npm run dev`. For a production build on a persistent single server, use `npm run build` and `npm start` behind HTTPS, set `MARKETLAB_APP_ORIGIN` to the exact public origin, and configure an absolute durable `MARKETLAB_DB_PATH`. Back up the SQLite database using SQLite's backup API or a consistent stopped-server copy, including WAL state if applicable. Do not expose the demo publicly without addressing its guest-account growth and process-local rate-limit limitations.

Optional administrator settings are `MARKETLAB_ADMIN_EMAIL` and `MARKETLAB_ADMIN_PASSWORD`. Set values securely. Server restarts retain accounts, wallets and sessions through the database; live processes are not part of the persistence model.

## Supabase and Vercel production path — not yet deployable

1. Create a Supabase project and record its URL and publishable/anonymous key. Keep service-role credentials server-only.
2. Apply `supabase/migrations/0001_core.sql` through Supabase migrations or the SQL editor in a disposable development project first. Apply `supabase/seed.sql`. This creates the schema foundation only.
3. Configure Auth email/password, verification, email templates, SMTP, allowed site and callback/reset URLs. Production UI callbacks, password reset and SSR token refresh are still to be implemented.
4. Create profiles on signup using a trusted trigger or backend. Privileged admin assignment must be performed through a reviewed server-side administrative procedure; never permit browser role writes.
5. Implement the Supabase persistence/auth adapter, transactional execution and session RPCs, RLS tests, retention jobs and scheduled expiry. The current application does not read the Supabase schema.
6. Select licensed price, historical, news, FX and calendar providers. Verify exchange coverage and rights. Implement adapters with visible source, delay and timestamp metadata; configure their secrets securely.
7. Implement the LLM provider and grounded explanation contract; keep order execution inaccessible to the model.
8. Implement Web Push delivery and authorized scheduled ingestion/finalization with a durable scheduler. Vercel Cron can call protected idempotent endpoints for supported schedules; higher-frequency streaming requires a supported durable worker elsewhere.
9. Run financial, API, RLS and desktop/mobile end-to-end checks with production adapters. Test simultaneous writes and replay cutoff leakage. Production readiness requires these checks, not just a Next.js build.
10. Push the reviewed repository to GitHub. Import it in Vercel, select Next.js and the supported Node runtime, configure the Supabase and selected provider environment variables. Never use the SQLite demo backend in Vercel.
11. Deploy only after the persistence switch is implemented and verified. Confirm login, authorization, funding, orders, refresh restoration, unattended expiry, report generation and source attribution against the deployed origin.
12. Add a custom domain, configure DNS and TLS, update Supabase callback URLs and trusted app origin, and rerun authentication and origin checks.

No production deployment has been performed. Typical blockers: ephemeral SQLite storage, missing profile creation/RPCs, incorrect Auth redirect URLs, provider entitlements, secret destinations, and unsupported background workers. Diagnose the failing operation before changing permissions or adding duplicate secrets.

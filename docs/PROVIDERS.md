# Provider integration requirements

The active provider is an immutable, explicitly illustrative demo fixture. No provider credential is needed and no fake real news is seeded. AI reference responses are authored educational content, labeled as non-LLM.

Do not select a real-data default until current documentation, exchange entitlements, redistribution rights, timestamps, retention limits and geographic coverage have been checked. Potential candidates for evaluation include Alpha Vantage and Twelve Data for price/fundamental APIs, licensed exchange or vendor feeds for NSE/BSE, and publisher-authorized feeds for news. This document does **not** assert current plan coverage, licensing or pricing.

A provider adapter must implement and test:

- Exchange-qualified instrument identifiers and currency; country coverage must be explicit.
- Timestamped OHLCV with observed time, provider, delay and mode.
- Licensed excerpts and original source URLs for news; publication and ingestion timestamps; fingerprint-based deduplication.
- Market calendars with exchange timezone, weekends, holiday exceptions and closures.
- Corporate actions and adjusted/unadjusted series distinctions.
- Rate limits, cache expiry, retry policy and visible unavailable states.
- Historical cutoff enforcement for prices, related news, fundamentals and AI context.

Keys stay on the server. Add only the selected provider's destination domains to environment network settings. Test a read-only operation with injected credentials before requesting new ones. Never put credentials in chat, source control, saved startup instructions or browser bundles.

An LLM implementation should return structured facts, positive/negative scenarios, uncertainty, further questions and educational concepts grounded in authorized sources. It must refuse to invent missing facts or issue personalized trading instructions. Browser push requires VAPID keys, secure subscription persistence, explicit browser consent, a service worker, deduplication and a rate-limited delivery worker. None of these integrations is activated merely by setting the Supabase variables in `.env.example`.

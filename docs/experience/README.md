# Research assistant, inquiries and analytics

Implemented September 30; activated and provider-tested October 1, 2026. Assistant responses, consented events, owner OAuth and a signed real delivery webhook are verified. Replay payload masking and actual PostHog playback passed with synthetic content; public sampling is enabled in the follow-up release. See PROJECT_STATUS.md for verification limits.

## Architecture and ownership

- `components/experience/`: lazy assistant panel, deterministic editable inquiry builder, explicit consent preferences, navigation/engagement observer, private inbox UI.
- `lib/experience/`: public retrieval, Responses streaming adapter, encrypted Redis storage, signed consent, strictly typed events, server capture, signed delivery webhooks, restricted GitHub authentication.
- `scripts/build-knowledge.mjs`: rebuilds 65 public documents (9 evaluated studies, 4 synthetic demonstrations, 51 planned topics and biography). Uses the actual route-to-component mapping. Removes withdrawn/draft entries; never indexes career files or private recipient configuration. `prebuild` refreshes it; versions hash source content. Changes to extracted public content require review of the generated diff.
- Contact still uses the existing `/api/contact`, Turnstile, Resend and shared Redis limits. A fresh token is needed for every attempt. Immutable encrypted inquiry receipt is written before the email request. Provider acceptance uses the existing idempotency key. Delivered/bounced comes only from signed webhooks.
- OpenAI has no tools, browsing, code execution or email operation. Public evidence and visitor input are marked untrusted. The model is not a factual guarantee: funded-provider grounded-answer and injection evaluations pass their bounded checks, with no guarantee of perfect future wording. Cards use application-selected canonical links, never generated URLs. Contextual queries prioritize the selected study; planned cards expose no completed findings.

## Live owner links

Sign in to [the owner inbox](https://michaelpgibb.com/owner) with GitHub account `mpgibb`. PostHog requires your existing authenticated account; dashboards are not public.

| Dashboard | Link |
| --- | --- |
| Traffic and acquisition | https://us.posthog.com/project/638719/dashboard/2156478 |
| Research performance | https://us.posthog.com/project/638719/dashboard/2156481 |
| Visitor journeys | https://us.posthog.com/project/638719/dashboard/2156482 |
| AI performance | https://us.posthog.com/project/638719/dashboard/2156483 |
| Contact conversion | https://us.posthog.com/project/638719/dashboard/2156484 |
| Experience quality | https://us.posthog.com/project/638719/dashboard/2156485 |

All 46 insight queries were exercised against the provider. Acceptance-test profiles use `portfolio_test=true`; filters join current person properties to exclude historical events as well. The controlled test yielded one inquiry, provider acceptance and delivered webhook; those records are verification evidence, not real prospect conversions. PostHog totals exclude them. Refresh cached dashboard results after changing filters. Replay masks all text and private sections while retaining public layout. CSS generated content/resources are stripped; browser and asset rendering can differ from the original page.

## Reproduction and recovery configuration

Keep ordinary contact and its six existing private variables, three Turnstile variables, DNS and mailbox unchanged. The earlier explicitly confirmed destination is `mike@michaelpgibb.com`; the stale alternate-domain address in the brief is not applied. The recipient remains server-only.

1. **OpenAI:** choose the owner's API project, confirm API billing/budget approval, and create a restricted project credential for Responses requests. Store `OPENAI_API_KEY` privately in Vercel Production. Set `AI_ENABLED=true` only after acceptance testing. ChatGPT subscription access alone is not an API billing configuration.
2. **PostHog:** sign in/select the intended private project and confirm a suitable free plan and retention eligibility. Set `POSTHOG_PROJECT_TOKEN` (public ingestion credential), `POSTHOG_HOST=https://us.i.posthog.com` or the EU equivalent, and `POSTHOG_PROJECT_ID`. Store a narrowly scoped **private** `POSTHOG_PERSONAL_API_KEY` for privacy deletion; use a separate local admin credential with dashboard/insight write permissions to run `node scripts/import-dashboards.mjs`. Set `POSTHOG_ADMIN_HOST` only locally. Configure America/Chicago, one-year event retention (owner-approved free plan) and 30-day replay retention before enabling `ANALYTICS_ENABLED=true`. No automatic plan upgrade is performed.
3. **Owner inbox:** create/select a GitHub OAuth app with homepage `https://michaelpgibb.com` and callback `https://michaelpgibb.com/api/auth/callback/github`. Production private variables: `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, random `AUTH_SECRET` (at least 32 characters), `AUTH_URL=https://michaelpgibb.com`, `OWNER_GITHUB_ID=4212420` (confirmed mpgibb numeric ID). The app requests `read:user`; no repository write permission. Every private API and server-rendered page checks the authenticated numeric account ID, not the display name or supplied email. A 30-minute signed JWT session is used.
4. **Resend:** register `https://michaelpgibb.com/api/webhooks/resend` for `email.delivered` and `email.bounced`; store its secret as `RESEND_WEBHOOK_SECRET` in Vercel Production. Verify a signed test event and a separately authorized labeled delivery test. A 503 webhook response requests retry when its inquiry mapping is not yet available. Unknown IDs never create inquiries.
5. Redeploy to apply environment changes, verify the live integrations, import dashboards, and inspect one known synthetic journey in PostHog. Replay stays `REPLAY_ENABLED=false` until an actual recording has been inspected for static/dynamic masking, query stripping, private-page exclusion and withdrawal. Only then enable replay with the approved finite retention. No service is claimed live from configuration names alone.

## Limits and costs

| Service | Defaults / bounds | Commitment |
| --- | --- | --- |
| Responses | `gpt-5-mini`, 2,000 output tokens, 12,000 combined instruction/input bytes, 60-second timeout | Funded and approved; usage is charged to existing API credit |
| Chat security | 15 minutes, 20 messages/session, 3/minute, 30/network/hour, 5 session starts/network/hour | Existing shared Upstash |
| AI daily caps | `AI_DAILY_REQUEST_LIMIT=100`, `AI_DAILY_TOKEN_LIMIT=200000`, conservative 15,024-token reservation per request; `$0.008` reservation per request, `AI_DAILY_COST_MICRODOLLARS=500000` ($0.50) | Reservations are retained on failure/cancellation; the token cap is usually stricter than the cost cap |
| Analytics | `ANALYTICS_DAILY_EVENT_LIMIT=1000`, 150 browser events/day, at most 10 events/request, 12 KB body | At most about 30,000 accepted events/month; verify current free eligibility |
| Replay | Separate opt-in; `REPLAY_SAMPLE_RATE=0.1` maximum, shared cap 10 sessions/day | Existing free plan; 30-day retention |
| Contact | Existing 5 attempts/network/hour and 90 new inquiries/day | Existing Resend/Porkbun setup |
| Local records | `INQUIRY_RETENTION_DAYS=90` (max365); journeys30d; aggregate operations30d; chat<=15min | Reuses existing Redis |

Current reviewed OpenAI reference pricing: $0.25/million input tokens and $2/million output tokens for gpt-5-mini. Estimated event cost is separate from invoices and ignores any discounts; incomplete/cancelled requests can still be billed. Conservative reservations remain charged to application caps when actual provider usage is unknown. No tokens or raw prompts enter operational logs. Essential operational counters have no browser/session identity and remain separate from consented AI-performance reports. Review actual provider balances/plan limits before enabling services; no paid plan was selected in code.

## Owner access and deletion

After OAuth activation, open `/owner`, sign in with mpgibb, and review supplied contact details, complete approved message, project context, consented journey (if available), referral categories and separate receipt/delivery timestamps. The inbox paginates 50 records at a time. Its JSON export requires the same authentication. Owner visits receive a browser exclusion preference; other unrecognized owner devices cannot be reliably excluded before sign-in.

Delete requires an authenticated same-origin request and UUID. For a linked PostHog profile, the endpoint first requests event and recording deletion through the private API, checks the queued flags/error list, then removes the local encrypted inquiry, status, email mapping and associated local session journey. It creates a seven-day non-PII deletion receipt and blocks future capture under that browser ID. **Queued provider deletion is not verified completion**: check PostHog's deletion-status UI/API. If that API is unavailable or lacks permission, local deletion fails visibly so the linkage needed for a retry is not lost. Untracked inquiries can be deleted without PostHog configuration. Mailbox copies are separate.

Encryption uses AES-256-GCM with an HKDF-separated key derived from the existing private hash secret. Do not rotate that secret without migrating or retaining access to unexpired records. Redis TTLs enforce application retention; backups and provider logs require their own policies. Inquiry index entries are pruned on new submissions, and expired payloads are never returned.

## Measurement interpretation

Use the owner inbox for essential application totals. PostHog represents a consented, filtered, volume-limited subset. Declined consent, blockers, unknown referrers, excluded owner/test/bot traffic, expiry and unavailable vendor requests cause differences. Do not reconstruct missing history. An opaque browser identifier is not a person or verified account. No email hashes, employer guesses or automatic identity merging are used.

`posthog-dashboards.json` contains six private dashboards and ordered funnels. `scripts/import-dashboards.mjs` reuses only matching names with the portfolio tag, preserving unrelated dashboards. Run imports only against the intended project. The imported dashboards and their live query validation are recorded above. Revalidate changed query definitions before deployment. PostHog date/device/source/project filters, count tables and exports are available through its authenticated insight interface. The same-session funnels aggregate on `properties.session_id` over30minutes; longer attribution groups by random browser ID over7days. Conversion is counted once per starting aggregate with an ordered sequence. Inquiries denote application receipt; email stages remain separate. Association with assistant use does not show causation.

## Verification and rollback

Run `pnpm install --frozen-lockfile`, `pnpm test:security`, `pnpm test:contact`, `pnpm test:experience`, `pnpm test:refinements`, `pnpm check`, `pnpm test:smoke --start`. Redis CLI/server are required for the atomic/concurrency tests. `node scripts/serve-experience-test.mjs` is a local-only fixture with synthetic model/email/analytics transports; it cannot be imported into production. Its Cloudflare always-pass key is development-only. Actual provider calls, authenticated dashboards and recorded replays still require activation checks.

Operational disable switches: set `AI_ENABLED=false`, `ANALYTICS_ENABLED=false`, `REPLAY_ENABLED=false` and redeploy. Ordinary browsing and verified contact remain independent. Missing OAuth fails closed. To undo this release fully, promote the prior verified Vercel deployment for commit `edcc1f25c64478d3cabf17c31fe46939b60d3888`, or revert the feature commit and let existing GitHub integration deploy. Keep inquiry records and secrets needed to read them; do not reset Redis or alter DNS/email to roll back UI.

## Primary references reviewed

- [Responses streaming](https://developers.openai.com/api/docs/guides/streaming-responses), [Responses migration/storage](https://developers.openai.com/api/docs/guides/migrate-to-responses), [gpt-5-mini](https://developers.openai.com/api/docs/models/gpt-5-mini).
- [PostHog configuration](https://posthog.com/docs/libraries/js/config), [replay privacy](https://posthog.com/docs/session-replay/privacy), [data deletion](https://posthog.com/docs/privacy/data-storage), [dashboard API](https://posthog.com/docs/api/dashboards), [insights](https://posthog.com/docs/api/insights).
- [Auth.js GitHub](https://authjs.dev/getting-started/providers/github), [Resend webhook verification](https://resend.com/docs/webhooks/verify-webhooks-requests). Svix2 verifies the raw payload and returns no parsed value; JSON is parsed only after signature verification.

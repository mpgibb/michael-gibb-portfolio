# Managed verification implementation and activation

## Release state

This change is prepared locally against portfolio commit `5fd0dcb5df697c1cff10a8a6f014177c3a64f46f`. It is **not deployed**. The existing production contact form remains unchanged until the real Turnstile widget is configured and a reviewed release is deployed. There is no production bypass flag. Deploying this code without valid configuration disables submissions and shows the existing unavailable/LinkedIn state.

The current repository has an ordinary contact form but **no visitor assistant, AI provider adapter, analytics/consent system or owner inbox**. The contact integration is implemented. The server session and AI authorization factories are implemented and tested as a foundation; they are not a claim that an assistant or the attached broader analytics program is live. No model credentials, paid inference, analytics account or new production AI endpoint has been introduced. The scope decision about the broader attached program remains outstanding.

## Contact flow

`ContactForm` validates fields before asking `TurnstileVerification` for a token. The script loads only after Send or Retry; page reads and research browsing do not execute challenges. The Managed widget uses interaction-only appearance, flexible sizing and compact sizing below 300px of available form width. It never caches a successful token as a session credential. Each send attempt requests a new token. Errors, expiry, timeouts and outages preserve the form values and original delivery request ID. Keyboard focus remains on the submit button during verification and after failure.

`/api/contact` applies the existing same-origin, JSON size (20,000 bytes), field, honeypot and production-configuration checks. It then verifies an exact configured origin/hostname and trusted Vercel network header. A Redis Lua transaction limits verification attempts and reserves a keyed hash of the challenge token before Siteverify. The Cloudflare request times out after six seconds. It must return `success: true`, the exact current allowed hostname, `action: contact_submit`, and a recent challenge timestamp. Invalid, expired, already-used, wrong-host and wrong-action tokens are rejected. Provider or Redis failure fails closed. There is no client “verified” flag.

Only then can the existing delivery reservation execute. Payload/request-ID binding, pending reservations, accepted receipts and the stable Resend idempotency key remain intact. Even an already accepted retry obtains fresh verification, then returns its existing receipt without sending a second email. Keep retries within the existing 24-hour deduplication window. Acceptance still means provider acceptance, not inbox delivery.

Assistant-initiated inquiries must use this **same** endpoint and fresh `contact_submit` verification, even when the visitor has a valid chat cookie. A chat cookie never authorizes sending an inquiry. An eventual assistant should copy only the visitor-approved, editable draft into the shared form, require an explicit Send action, and keep its delivery request ID stable across verification retries.

## Chat security foundation

`createChatSessionHandler` accepts only a bounded 3,000-byte same-origin JSON request with a fresh token. It validates `chat_init` and sets a random 256-bit credential in `__Host-portfolio-chat`, with `Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=900` and no Domain attribute. Only its keyed hash appears in Redis. The session expires server-side after 15 minutes; browser clock changes cannot extend it. It is bound to a keyed network-address hash; network changes require new verification. Session issuance is independently capped and does not reset shared usage limits.

All future answer, summary or draft-generation endpoints must use `createProtectedChatHandler`, which validates a strict 10,000-byte request envelope and a message of at most 2,000 characters, then calls `authorizeChat` **before** the provider adapter. One Redis Lua transaction verifies expiry and network binding, checks all limits, rejects repeated operation IDs, establishes a single in-flight operation and reserves a pessimistic input-plus-output token allowance. Request IDs are random UUIDs and must be reused for transport retries, not for deliberately new questions. There is no silent re-execution of an uncertain paid request.

The caller must supply a truthful upper bound covering instructions, retrieved context, history and maximum output, and enforce those sizes in its provider adapter. The factory has a 60-second abort deadline. For a streaming adapter, use `releaseOnReturn: false` and call `releaseChat` in the stream's completion/cancellation/error cleanup. Locks otherwise expire after 90 seconds. Do not add an unguarded auxiliary AI route. No limits are refunded after an uncertain call, failure or cancellation. The foundation counts simulated provider invocations in tests; actual model billing cannot be verified until a provider adapter exists.

## Shared limits and retention

All counters and authorization decisions use the existing Upstash Redis service, not per-instance memory. Windows begin at the first reservation and expire using Redis TTLs.

| Control | Bound / retention |
| --- | --- |
| Verification attempts | 20 per network per 10 minutes; 3,000 application-wide per day |
| Used challenge hashes | 310 seconds; never raw tokens |
| Contact submissions | Existing 5 attempts per network/hour and 90 new inquiries/day |
| Contact deduplication | Existing 24-hour payload/request bindings and delivery receipts |
| New chat sessions | 5 per network/hour |
| Chat session | 15 minutes, at most 20 messages, one in-flight request |
| Chat rate | 3 requests/session/minute; 30 requests/network/hour |
| Daily AI requests | `AI_DAILY_REQUEST_LIMIT`, default 100, configurable 1–1,000 |
| Daily reserved tokens | `AI_DAILY_TOKEN_LIMIT`, default 200,000, configurable 10,000–10,000,000 |
| AI request deduplication | 24 hours |

Session overuse, expiry and changed network invalidate or reject the session and require verification again. Application/network caps remain enforced after re-verification. Token reservations are a conservative application budget, not a promise about a provider's invoice. Apply provider account spending limits separately before activating a model.

## Essential security events and consent

Security logs contain only `event`, `action`, `outcome`, `category` and `latency_ms`. Outcomes are `accepted`, `rejected` or `unavailable`; categories are controlled literals such as `expired_or_used`, `hostname_mismatch`, `action_mismatch`, `attempt_limit`, `siteverify_unavailable` and `store_unavailable`. There are no tokens, secrets, addresses, form values or chat contents. Failed verification is not labeled a confirmed bot. Logger failure cannot authorize a request or break a valid operation.

These are operational security logs, separate from any future consented behavioral event stream. Neither verification nor chat authorization reads an analytics-consent cookie. A rejected-consent cookie is exercised in the server tests. There is currently no analytics banner or analytics script to verify in a browser; no claim is made that the broader consent/replay system is implemented. Security records use the finite Redis TTLs above. Vercel/Cloudflare operational-log retention remains governed by their account settings; inspect retention before adding exports or analytics destinations. Do not send these logs to consented behavioral analytics or enable request-body capture.

The privacy page describes contact verification, Cloudflare, keyed hashes, expiry and essential security processing. When an assistant is actually exposed, extend it with the 15-minute essential chat cookie and the selected model/context-processing provider; do not publish fictitious data flows in advance.

## Exact activation steps

1. Sign in to the intended Cloudflare account. The inspected browser is currently at its sign-in page. No Cloudflare account, widget or secret was created during this work.
2. In **Turnstile → Add widget**, create or reuse a portfolio widget in **Managed** mode. Add only `michaelpgibb.com` and `www.michaelpgibb.com`. Do not add localhost, development hosts, wildcard production access or arbitrary preview domains. Keep pre-clearance off; a Cloudflare clearance cookie is not used as the application's chat credential. No nameserver, hosting or Porkbun DNS changes are required.
3. Set these variables on the existing Vercel project, scoped to **Production**:

   | Variable | Value / handling |
   | --- | --- |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Widget's real public sitekey; included in the browser build |
   | `TURNSTILE_SECRET_KEY` | Matching secret; private server-only sensitive setting |
   | `TURNSTILE_ALLOWED_HOSTNAMES` | `michaelpgibb.com,www.michaelpgibb.com` |

   Keep all six existing private delivery/store variables intact. No new mailbox credentials are needed. Do not paste keys into chat or commit them. Production and all Vercel deployments reject documented dummy-key patterns; Preview delivery/verification is deliberately disabled.
4. Deploy the reviewed code through the existing integration **after** configuration is present. The public key and form availability are evaluated at build time, so changing environment settings requires a new build. Verify public output does not contain the secret or private mailbox addresses.
5. Verify a real Managed challenge on the canonical production host, including keyboard/mobile behavior, invalid/missing token rejection, and one clearly labeled inquiry. Confirm provider acceptance and delivery separately. Confirm actual inbox receipt with the owner. Test keys and service doubles do not prove production verification or email delivery.

Cloudflare's [widget setup](https://developers.cloudflare.com/turnstile/get-started/), [server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) and [official testing keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) document these integration boundaries. Confirm current plan eligibility in the account before any plan selection; no paid commitment has been made.

## Reproduce verification

Use Node 24 and the repository's pinned pnpm. Install `redis-server` and `redis-cli` locally for integration tests; the suite starts a disposable Unix-socket-only Redis process with persistence disabled and stops it afterward. CI installs the test dependency without starting a persistent service.

```sh
pnpm test:security
pnpm test:contact
pnpm test:refinements
pnpm check
pnpm test:smoke --start
```

Twelve security groups exercise Siteverify success/expiry/reuse/hostname/action, missing and oversized requests, direct AI calls, separate cookie credentials, expiry, network changes, session/message/rate/global caps, concurrent handler instances, service outages, idempotent inquiry retries, rejected analytics consent and sanitized logs. Simulated provider invocation counts remain zero for rejected requests. Six contact regression groups retain prior delivery semantics. Security tests execute the actual Lua scripts in Redis; Cloudflare, email and AI responses are isolated service doubles.

For a local browser fixture, run `pnpm dev:security` and open `http://127.0.0.1:3102/#contact`. It refuses production/Vercel operation, uses Cloudflare's official passing **test sitekey**, a disposable Redis process and synthetic delivery. It imports no real credentials. A private `SECURITY_TEST_CONTROL_FILE` can contain `outage`, `expired` or `success` to exercise recovery; changing the mode flushes only this disposable fixture store. This test-only reset permits repeated use of Cloudflare's constant dummy token without weakening production replay protection. No fixture route is included in the application build.

Chrome responsive checks cover 320, 375, 390, 430, 768, 1024 and 1440px with no contact-form overflow and visible branding. Browser outage → expiry → success retains the same draft; Enter-key retries retain button focus. No Turnstile script/iframe loads before the first submit. Console inspection is clean. These checks use responsive desktop Chrome and a test widget, not physical phones, other engines or a real production interactive challenge. Screenshots and measurement JSON are retained outside the public repository.

## Rollback

Before activation, discard/revert only this reviewed change; the live release has not moved. After activation, prefer disabling contact through its existing unavailable state while diagnosing rather than introducing a verification bypass. If a complete application rollback is necessary, restore the verified pre-change production release `5fd0dcb5df697c1cff10a8a6f014177c3a64f46f` and disclose that it has the former rate/dedup controls but no Turnstile. Keep the existing Redis namespace and delivery receipts so retries cannot lose deduplication state. Do not flush the production store. Preserve all delivery variables, domain/mail DNS and service plans. Unused Turnstile credentials can be revoked only after the deployed build no longer requires them.

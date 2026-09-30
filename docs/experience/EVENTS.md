# Event dictionary and coverage

Schema v1 lives in `lib/experience/schema.ts`. Unknown keys, free text, unknown project IDs, arbitrary target URLs, invalid numbers and invalid categories are rejected on both sides. Event IDs are UUIDs; server conversion IDs are deterministic hashes of stage and inquiry UUID. Timestamps are UTC; dashboards use America/Chicago. Public paths exclude queries/fragments. `component`, `project_id`, count/position, broad intent and finite categories are controlled. Additional allowed properties are declared centrally; no user-generated prose is an analytics property.

| Events | Authority / instrumentation | Meaning |
| --- | --- | --- |
| page_view, page_exit | browser, route observer | One settled route view; last observable departure (not guaranteed on process termination) |
| active_reading | browser, visibility + recent key/pointer/scroll interaction | 5-second samples, reports at30seconds or departure; background/idle excluded |
| section_view, scroll_depth | browser, intersection/scroll | Once per section/25-50-75-100 milestone per route mount |
| navigation, menu | browser, delegated controlled links/expanded buttons | Header/footer/logo/menu/outbound destinations; never displayed arbitrary text |
| search | browser,700ms settled catalogue query | Broad intent + result count only; count0 is zero results, no raw query |
| filter | browser, catalogue | Controlled industry/method and change category |
| research_result | browser, catalogue article | Stable study/demo ID +1-based position |
| project_view | browser, public route map | Evaluated study or synthetic demo, not planned topic viewed as completed |
| download_click, source_click | browser, link | A click, never a claimed completed download |
| demo_start, demo_change, demo_run, demo_reset | browser, result explorers | First parameter interaction; settled600ms recalculation; explicit reset. Existing explorers use saved results; no inference/retraining is claimed |
| demo_error, application_error | browser | Controlled error category; no message, stack, URL query or console capture |
| assistant_open, assistant_close | browser, panel | Visitor initiated entry/exit; contextual project ID when supplied |
| message_submit | browser, compose | Submission intention, broad intent/mode only |
| conversation_start | server, authorized chat | Deduplicated session conversation UUID |
| response_complete, response_failed, response_cancelled | server, Responses adapter | Confirmed outcome; retrieved count, model/version where supplied, tokens, estimated cost, latency and controlled failure category |
| assistant_source, assistant_recommendation | browser, canonical evidence cards | A source-card click; recommendation event only for approved project IDs |
| assistant_feedback, contact_handoff | browser, explicit controls | Positive/negative choice; transition to inquiry builder |
| contact_view, contact_start, contact_validation, contact_attempt | browser, form/observer | Visible ordinary form, first edit, invalid fields, attempt; never conversions |
| inquiry_received | server, durable encrypted record | Exactly one application receipt per inquiry UUID; may precede failed email delivery |
| provider_accepted | server, actual Resend response ID | Provider accepted; not an inbox receipt |
| email_delivered, email_bounced | server, signed webhook | Verified provider event; replayed notifications deduplicate |
| contact_failed | server, provider failure | Controlled failure outcome; draft remains local and retry uses same delivery key |
| consent_change | server, accepted preference | Version/analytics/replay booleans only; rejection creates no analytics profile/event |
| page_performance | browser, supported PerformanceObserver | Largest-contentful-paint timing, bounded numeric value; optional browser support |
| $snapshot, $heatmaps, $rageclick, $dead_click | PostHog SDK, separate replay permission | Disabled until actual account/masking verification; support depends on PostHog capability and consent |

Both dropdown and catalogue searches report debounced categories/counts; industry selections use controlled taxonomy. Coverage limits: Explorer errors use the sanitized application-error channel if surfaced by the browser; successful saved-result calculations do not produce fabricated model-run errors. Anonymous exit/active time can be lost when a browser terminates abruptly. Bot/owner exclusions cover reliable signals, not every possible bot or unrecognized owner device. AI rate rejections are essential sanitized security outcomes; they are not proof of malicious behavior. Funnel dashboards represent consented observations only.

Typed helpers: `analytics-client.ts` emits browser-owned events; `/api/telemetry` rejects server event names, cross-origin attempts, stale timestamps, non-consent, DNT/GPC, recognized bots and owner exclusion. Shared Redis deduplicates/limits events across instances. `analytics-server.ts` attaches signed consent identifiers and uses a vendor timeout; failure cannot fail the functional workflow. Server-stage delivery events require retained consent and are separate from essential records. No background retry worker or recurring job is created; failed optional capture can undercount.

Shared source/campaign/device/browser are supplied from signed consent. Referrers reduce to direct/LinkedIn/GitHub/Google/Bing/other. Campaigns reduce to a short allowlist or other. Country comes from Vercel's validated-format country header, not client input or raw-IP analytics enrichment. Changing consent creates no retroactive journey. Returning browser measurement relies on optional local storage and remains approximate.

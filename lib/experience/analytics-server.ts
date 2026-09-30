import { randomUUID, createHash } from "node:crypto";
import { database, budgetScript, boundedSetting } from "./store.ts";
import { eventSchema, type Event, type Properties } from "./schema.ts";
import { trackingAllowed, type Consent } from "./consent.ts";
import type { Environment } from "../request-security.ts";
export async function recordEvent(event: Event, consent: Consent | null, env: Environment = process.env, transport: typeof fetch = fetch) {
  if (!trackingAllowed(consent, env) || !consent) return;
  const parsed = eventSchema.safeParse(event); if (!parsed.success) return;
  try {
    const db = database(env, transport); const day = new Date().toISOString().slice(0, 10);
    if (await db.command("EXISTS", `${db.prefix}:withdrawn:${consent.browser}`)) return;
    const allowed = await db.command("EVAL", budgetScript, 2, `${db.prefix}:events:${day}`, `${db.prefix}:event:${event.id}`, 1, boundedSetting(env.ANALYTICS_DAILY_EVENT_LIMIT, 1000, 10000));
    if (allowed !== 1) return;
    const local = { ...parsed.data, time: parsed.data.time };
    const journeyKey = `${db.prefix}:journey:${consent.session}`;
    await db.command("EVAL", `redis.call('RPUSH',KEYS[1],ARGV[1]);redis.call('LTRIM',KEYS[1],-150,-1);redis.call('EXPIRE',KEYS[1],2592000);return 1`, 1, journeyKey, JSON.stringify(local));
    if (!env.POSTHOG_PROJECT_TOKEN || !["https://us.i.posthog.com", "https://eu.i.posthog.com"].includes(env.POSTHOG_HOST ?? "")) return;
    const response = await transport(`${env.POSTHOG_HOST}/capture/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ api_key: env.POSTHOG_PROJECT_TOKEN, event: event.name, timestamp: local.time, properties: { ...event.properties, ...consent.attribution, distinct_id: consent.browser, $session_id: consent.session, session_id: consent.session, $insert_id: event.id, $process_person_profile: true, $geoip_disable: true, $ip: null, schema_version: 1, environment: "production", page_path: event.path, page_type: event.path.startsWith("/research/") ? "study" : event.path.startsWith("/projects/") ? "demo" : event.path === "/" ? "home" : "page", source_component: event.component, consent_version: 1 } }), signal: AbortSignal.timeout(2500) });
    if (!response.ok) console.warn("analytics_capture_unavailable");
  } catch { /* Optional analytics never block the visitor workflow. */ }
}
export async function serverEvent(name: Event["name"], consent: Consent | null, properties: Properties, idSeed?: string, env: Environment = process.env, transport: typeof fetch = fetch) {
  const digest = idSeed ? createHash("sha256").update(`${name}:${idSeed}`).digest("hex") : "";
  const id = digest ? `${digest.slice(0,8)}-${digest.slice(8,12)}-4${digest.slice(13,16)}-8${digest.slice(17,20)}-${digest.slice(20,32)}` : randomUUID();
  await recordEvent({ id, name, path: properties.project_id ? "/research" : "/", component: "server", properties, time: new Date().toISOString() }, consent, env, transport);
}

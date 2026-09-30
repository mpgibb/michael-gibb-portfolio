import { database, boundedSetting } from "./store.ts";
import { readConsent, trackingAllowed, type Consent } from "./consent.ts";
import { serverEvent } from "./analytics-server.ts";
import type { ContactFields } from "../contact-validation.ts";
import type { Environment } from "../request-security.ts";
export type Inquiry = { id: string; created: string; expires: string; fields: ContactFields; origin: "ordinary" | "assistant"; projects: string[]; consent: Consent | null; journey: unknown[]; status?: Record<string, string> };
export async function receiveInquiry(id: string, fields: ContactFields, request: Request, origin: Inquiry["origin"], projects: string[], env: Environment, transport: typeof fetch) {
  const db = database(env, transport); const key = `${db.prefix}:inquiry:${id}`;
  const rawConsent = readConsent(request, env);
  const consent = !trackingAllowed(rawConsent, env) || request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1" || request.headers.get("cookie")?.includes("portfolio-owner-exclude=1") ? null : rawConsent; const seconds = boundedSetting(env.INQUIRY_RETENTION_DAYS, 90, 365) * 86400;
  let journey: unknown[] = [];
  if (consent?.analytics && consent.session) { try { const rows = await db.command("LRANGE", `${db.prefix}:journey:${consent.session}`, 0, -1); if (Array.isArray(rows)) journey = rows.map(row => JSON.parse(row)); } catch { /* Unknown attribution stays unknown. */ } }
  const record: Inquiry = { id, created: new Date().toISOString(), expires: new Date(Date.now() + seconds * 1000).toISOString(), fields, origin, projects, consent, journey };
  const created = await db.command("EVAL", `if redis.call('EXISTS',KEYS[1]) == 1 then return 0 end;redis.call('SET',KEYS[1],ARGV[1],'EX',ARGV[2]);redis.call('ZADD',KEYS[2],ARGV[3],ARGV[4]);redis.call('ZREMRANGEBYSCORE',KEYS[2],'-inf',ARGV[5]);return 1`, 2, key, `${db.prefix}:inquiries`, db.seal(record), seconds, Date.now(), id, Date.now() - seconds * 1000);
  if (created !== 0 && created !== 1) throw new Error("inquiry_storage_failed");
  if (created === 1) await serverEvent("inquiry_received", consent, { inquiry_id: id, category: origin, project_id: projects[0] }, id, env, transport);
  return consent;
}
export async function updateInquiry(id: string, stage: "provider_accepted" | "email_delivered" | "email_bounced", providerId: string, env: Environment, transport: typeof fetch = fetch) {
  const db = database(env, transport); const key = `${db.prefix}:inquiry:${id}`;
  const raw = await db.command("GET", key); if (typeof raw !== "string") return;
  const record = db.open<Inquiry>(raw); const ttl = Math.ceil((new Date(record.expires).getTime() - Date.now()) / 1000); if (ttl <= 0) return;
  await db.command("HSETNX", `${key}:status`, stage, new Date().toISOString());
  await db.command("HSETNX", `${key}:status`, "provider_id", providerId);
  await db.command("EXPIRE", `${key}:status`, ttl);
  await db.command("SET", `${db.prefix}:provider:${providerId}`, id, "EX", ttl);
  await serverEvent(stage, record.consent, { inquiry_id: id, category: record.origin, project_id: record.projects[0] }, id, env, transport);
}
export async function listInquiries(env: Environment = process.env, offset = 0) {
  const db = database(env);
  const rows = await db.command("EVAL", `local ids=redis.call('ZREVRANGE',KEYS[1],ARGV[2],tonumber(ARGV[2])+49);local out={};for _,id in ipairs(ids) do local key=ARGV[1]..':inquiry:'..id;local raw=redis.call('GET',key);if raw then table.insert(out,{raw,redis.call('HGETALL',key..':status')}) end end;return out`, 1, `${db.prefix}:inquiries`, db.prefix, offset);
  if (!Array.isArray(rows)) return [];
  return rows.map(([raw,status]) => ({ ...db.open<Inquiry>(raw), status: Object.fromEntries(Array.from({length: status.length / 2}, (_, i) => [status[i * 2], status[i * 2 + 1]])) }));
}
export async function deleteInquiry(id: string, env: Environment = process.env) {
  const db = database(env); const key = `${db.prefix}:inquiry:${id}`; const raw = await db.command("GET", key); if (typeof raw !== "string") return;
  const record = db.open<Inquiry>(raw); const provider = await db.command("HGET", `${key}:status`, "provider_id");
  // Provider deletion must complete before local deletion, allowing a safe retry.
  if (record.consent?.browser) {
    if (!env.POSTHOG_PERSONAL_API_KEY || !env.POSTHOG_PROJECT_ID) throw new Error("analytics_deletion_configuration_required");
    const host = env.POSTHOG_HOST === "https://eu.i.posthog.com" ? "https://eu.posthog.com" : "https://us.posthog.com";
    const result = await fetch(`${host}/api/projects/${env.POSTHOG_PROJECT_ID}/persons/bulk_delete/`, { method: "POST", headers: { Authorization: `Bearer ${env.POSTHOG_PERSONAL_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ distinct_ids: [record.consent.browser], delete_events: true, delete_recordings: true }), signal: AbortSignal.timeout(10000) });
    if (!result.ok) throw new Error("analytics_deletion_unavailable");
    const data = await result.json();
    if (data.deletion_errors?.length || !data.events_queued_for_deletion || !data.recordings_queued_for_deletion) throw new Error("analytics_deletion_not_confirmed");
    await db.command("SET", `${db.prefix}:deletion:${id}`, JSON.stringify({ requested: new Date().toISOString(), provider: "PostHog", status: "queued_not_yet_verified" }), "EX", 604800);
    await db.command("SET", `${db.prefix}:withdrawn:${record.consent.browser}`, "1", "EX", 15552000);
  }
  const keys = [key, `${key}:status`, ...(typeof provider === "string" ? [`${db.prefix}:provider:${provider}`] : []), ...(record.consent?.session ? [`${db.prefix}:journey:${record.consent.session}`] : [])];
  await db.command("DEL", ...keys); await db.command("ZREM", `${db.prefix}:inquiries`, id);
}

import { createHmac, randomUUID } from "node:crypto";
import { isIP } from "node:net";
import { z } from "zod";
import { contactRequestSchema, fieldErrors } from "./contact-validation.ts";

const configuration = z.object({
  RESEND_API_KEY: z.string().min(10), CONTACT_TO_EMAIL: z.string().email(), CONTACT_FROM_EMAIL: z.string().email(),
  UPSTASH_REDIS_REST_URL: z.string().url().refine(value => value.startsWith("https://")), UPSTASH_REDIS_REST_TOKEN: z.string().min(10), CONTACT_HASH_SECRET: z.string().min(32),
});
type Configuration = z.infer<typeof configuration>;
export const isContactConfigured = (environment: Record<string, string | undefined> = process.env) => environment.VERCEL_ENV !== "preview" && configuration.safeParse(environment).success;
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
const reply = (status: number, body: object, extra: Record<string, string> = {}) => Response.json(body, { status, headers: { ...headers, ...extra } });
const unavailable = () => reply(503, { error: "Your message was not confirmed sent. Please wait a moment and try again. Your entries are still here." });
const hash = (value: string, secret: string) => createHmac("sha256", secret).update(value).digest("hex");

// One atomic reservation across every serverless instance. Only keyed hashes,
// random delivery tokens, timestamps and counters enter the shared store.
export const reserveScript = `
local request = redis.call('GET', KEYS[4])
if request and request ~= ARGV[3] then return {4, ''} end
local raw = redis.call('GET', KEYS[3])
local record = raw and cjson.decode(raw) or nil
if record and record.state == 'accepted' then return {2, record.token} end
if record and record.next > tonumber(ARGV[2]) then return {3, ''} end
local count = tonumber(redis.call('GET', KEYS[1]) or '0')
local total = tonumber(redis.call('GET', KEYS[2]) or '0')
if count >= 5 or (not record and total >= 90) then return {5, ''} end
if redis.call('INCR', KEYS[1]) == 1 then redis.call('EXPIRE', KEYS[1], 3600) end
if not record and redis.call('INCR', KEYS[2]) == 1 then redis.call('EXPIRE', KEYS[2], 86400) end
local token = record and record.token or ARGV[1]
local pending = cjson.encode({state='pending', token=token, next=tonumber(ARGV[2])+15000})
if record then redis.call('SET', KEYS[3], pending, 'KEEPTTL') else redis.call('SET', KEYS[3], pending, 'EX', 86400) end
redis.call('SET', KEYS[4], ARGV[3], 'EX', 86400)
return {1, token}
`;

async function command(config: Configuration, values: (string | number)[], transport: typeof fetch) {
  const response = await transport(config.UPSTASH_REDIS_REST_URL, { method: "POST", headers: { Authorization: `Bearer ${config.UPSTASH_REDIS_REST_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(values), signal: AbortSignal.timeout(5000), cache: "no-store" });
  if (!response.ok) throw new Error("store_unavailable");
  const data = await response.json();
  if (data.error) throw new Error("store_unavailable");
  return data.result;
}

async function boundedJson(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 20000) throw new Error("body_too_large");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("empty_body");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 20000) { await reader.cancel(); throw new Error("body_too_large"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export function createContactHandler({ environment = process.env, transport = fetch }: { environment?: Record<string, string | undefined>; transport?: typeof fetch } = {}) {
  return async function handleContact(request: Request): Promise<Response> {
    const origin = request.headers.get("origin");
    // No cross-origin submission API. Preview delivery remains disabled even if
    // credentials were accidentally added to the preview environment.
    const requestUrl = new URL(request.url);
    const requestOrigin = `${environment.VERCEL ? "https:" : requestUrl.protocol}//${request.headers.get("host") ?? requestUrl.host}`;
    if (!origin || origin !== requestOrigin) return reply(403, { error: "Reload this page before sending your message." });
    if (!request.headers.get("content-type")?.startsWith("application/json")) return reply(415, { error: "Please use the contact form to send your message." });
    let input: unknown;
    try { input = await boundedJson(request); } catch { return reply(400, { error: "The request could not be read. Check the message length and try again." }); }
    const parsed = contactRequestSchema.safeParse(input);
    if (!parsed.success) return reply(400, { error: "Check the highlighted fields.", fields: fieldErrors(parsed.error) });
    if (parsed.data.website) return reply(400, { error: "The message could not be submitted. Please try again." });
    const config = configuration.safeParse(environment);
    if (!config.success || environment.VERCEL_ENV === "preview") return unavailable();
    const { name, email, company, phone, topic, message, requestId } = parsed.data;
    const normalized = { name, email, company, phone, topic, message };
    const digest = hash(JSON.stringify(normalized), config.data.CONTACT_HASH_SECRET);
    const forwarded = request.headers.get(environment.VERCEL ? "x-vercel-forwarded-for" : "x-forwarded-for")?.split(",")[0].trim() ?? "";
    if (environment.VERCEL && !isIP(forwarded)) return unavailable();
    const ip = isIP(forwarded) ? forwarded.toLowerCase() : "local";
    const keyPrefix = `portfolio-contact:${environment.VERCEL_ENV ?? "development"}`;
    const recordKey = `${keyPrefix}:message:${digest}`;
    try {
      const reservation = await command(config.data, ["EVAL", reserveScript, 4, `${keyPrefix}:rate:${hash(ip, config.data.CONTACT_HASH_SECRET)}`, `${keyPrefix}:total`, recordKey, `${keyPrefix}:request:${hash(requestId, config.data.CONTACT_HASH_SECRET)}`, randomUUID(), Date.now(), digest], transport);
      const [state, token] = reservation as [number, string];
      if (state === 2) return reply(200, { accepted: true });
      if (state === 3) return reply(409, { error: "This message is already being sent. Wait a few seconds before trying again." }, { "Retry-After": "15" });
      if (state === 4) return reply(409, { error: "The form changed during submission. Please send it again." });
      if (state === 5) return reply(429, { error: "Too many messages have been submitted. Please try again later; your entries are still here." }, { "Retry-After": "3600" });
      if (state !== 1 || typeof token !== "string") throw new Error("invalid_reservation");
      const response = await transport("https://api.resend.com/emails", {
        method: "POST", headers: { Authorization: `Bearer ${config.data.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `portfolio-contact/${token}` },
        body: JSON.stringify({ from: `Michael P. Gibb Portfolio <${config.data.CONTACT_FROM_EMAIL}>`, to: [config.data.CONTACT_TO_EMAIL], reply_to: normalized.email, subject: `Portfolio inquiry: ${topic || "General inquiry"}`, text: [`Full name: ${name}`, `Email address: ${normalized.email}`, `Company / organization: ${company || "Not provided"}`, `Phone number: ${phone || "Not provided"}`, `Discussion: ${topic || "Not specified"}`, "", "Message", "-------", message].join("\n") }),
        signal: AbortSignal.timeout(10000), cache: "no-store",
      });
      if (!response.ok) return unavailable();
      const result = await response.json();
      if (typeof result.id !== "string" || !result.id) return unavailable();
      // Provider acceptance is the success boundary. If persisting the receipt
      // fails, the same provider token still deduplicates any later retry.
      try { await command(config.data, ["SET", recordKey, JSON.stringify({ state: "accepted", token }), "EX", 86400], transport); } catch { console.warn("contact_receipt_store_unavailable"); }
      return reply(200, { accepted: true });
    } catch { console.warn("contact_delivery_unavailable"); return unavailable(); }
  };
}

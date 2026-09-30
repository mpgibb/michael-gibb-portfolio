import { createHmac, randomUUID } from "node:crypto";
import { isIP } from "node:net";
import { z } from "zod";

export type Environment = Record<string, string | undefined>;
export type VerificationAction = "contact_submit" | "chat_init";
export const securityHeaders = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex", "Vary": "Cookie, Origin" };
export const securityReply = (status: number, body: object, headers: Record<string, string> = {}) => Response.json(body, { status, headers: { ...securityHeaders, ...headers } });
export const keyedHash = (value: string, secret: string) => createHmac("sha256", secret).update(value).digest("hex");

const schema = z.object({
  UPSTASH_REDIS_REST_URL: z.string().url().refine(value => value.startsWith("https://")),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(10), CONTACT_HASH_SECRET: z.string().min(32),
  TURNSTILE_SECRET_KEY: z.string().min(10), NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(10),
  TURNSTILE_ALLOWED_HOSTNAMES: z.string().min(1),
});
export type SecurityConfig = z.infer<typeof schema> & { hostnames: string[]; prefix: string };
// All documented dummy keys start with a digit followed by x and zeroes.
const isTestingKey = (key: string) => /^[123]x0{8,}/.test(key);
export function securityConfiguration(environment: Environment): SecurityConfig | null {
  const result = schema.safeParse(environment);
  if (!result.success || environment.VERCEL_ENV === "preview") return null;
  const data = result.data;
  const hostnames = data.TURNSTILE_ALLOWED_HOSTNAMES.split(",").map(value => value.trim().toLowerCase());
  if (hostnames.some(value => !/^(localhost|[a-z0-9]+(?:[.-][a-z0-9]+)*)$/.test(value))) return null;
  const deployed = !!environment.VERCEL || environment.NODE_ENV === "production";
  if (deployed && (hostnames.some(value => value === "localhost" || isIP(value)) || isTestingKey(data.TURNSTILE_SECRET_KEY) || isTestingKey(data.NEXT_PUBLIC_TURNSTILE_SITE_KEY))) return null;
  return { ...data, hostnames, prefix: `portfolio-security:${environment.VERCEL_ENV ?? environment.NODE_ENV ?? "development"}` };
}

export async function storeCommand(config: Pick<SecurityConfig, "UPSTASH_REDIS_REST_URL" | "UPSTASH_REDIS_REST_TOKEN">, values: (string | number)[], transport: typeof fetch): Promise<unknown> {
  const response = await transport(config.UPSTASH_REDIS_REST_URL, { method: "POST", headers: { Authorization: `Bearer ${config.UPSTASH_REDIS_REST_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(values), signal: AbortSignal.timeout(5000), cache: "no-store" });
  if (!response.ok) throw new Error("store_unavailable");
  const data = await response.json();
  if (!data || data.error || !("result" in data)) throw new Error("store_unavailable");
  return data.result;
}

export async function boundedJson(request: Request, maximum = 20000): Promise<unknown> {
  if (Number(request.headers.get("content-length") ?? 0) > maximum) throw new Error("body_too_large");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("empty_body");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maximum) { await reader.cancel(); throw new Error("body_too_large"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export function requestContext(request: Request, environment: Environment, config: SecurityConfig) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  const expectedOrigin = `${environment.VERCEL ? "https:" : url.protocol}//${request.headers.get("host") ?? url.host}`;
  if (!origin || origin !== expectedOrigin || request.headers.get("sec-fetch-site") === "cross-site") return null;
  let hostname: string;
  try { hostname = new URL(origin).hostname; } catch { return null; }
  if (!config.hostnames.includes(hostname)) return null;
  const forwarded = request.headers.get(environment.VERCEL ? "x-vercel-forwarded-for" : "x-forwarded-for")?.split(",")[0].trim() ?? "";
  if (environment.VERCEL && !isIP(forwarded)) return null;
  const ip = isIP(forwarded) ? forwarded.toLowerCase() : "local";
  return { hostname, ip, networkHash: keyedHash(`network:${ip}`, config.CONTACT_HASH_SECRET) };
}
export type RequestContext = NonNullable<ReturnType<typeof requestContext>>;

export type SecurityEvent = { event: "security_verification" | "security_session"; action: VerificationAction | "chat_message"; outcome: "accepted" | "rejected" | "unavailable"; category: string; latency_ms: number };
export type SecurityLogger = (event: SecurityEvent) => void;
export const securityLogger: SecurityLogger = event => console.info(JSON.stringify(event));
export function recordSecurity(logger: SecurityLogger, event: SecurityEvent) { try { logger(event); } catch { /* Telemetry is never an authorization decision. */ } }

// Count attempts before contacting Cloudflare; also reserve a keyed token hash
// atomically so racing instances cannot redeem the same token twice.
export const verificationReservationScript = `
local attempts = tonumber(redis.call('GET', KEYS[1]) or '0')
local total = tonumber(redis.call('GET', KEYS[2]) or '0')
if attempts >= 20 or total >= 3000 then return 3 end
if redis.call('INCR', KEYS[1]) == 1 then redis.call('EXPIRE', KEYS[1], 600) end
if redis.call('INCR', KEYS[2]) == 1 then redis.call('EXPIRE', KEYS[2], 86400) end
if ARGV[1] == 'missing' then return 4 end
if not redis.call('SET', KEYS[3], 'used', 'NX', 'EX', 310) then return 2 end
return 1
`;

export async function verifyTurnstile({ token, action, config, context, transport = fetch, logger = securityLogger, now = Date.now }: {
  token: string; action: VerificationAction; config: SecurityConfig; context: RequestContext; transport?: typeof fetch; logger?: SecurityLogger; now?: () => number;
}): Promise<Response | null> {
  const started = now();
  const finish = (category: string, status: number) => {
    recordSecurity(logger, { event: "security_verification", action, outcome: status === 200 ? "accepted" : status >= 500 ? "unavailable" : "rejected", category, latency_ms: Math.max(0, now() - started) });
    if (status === 200) return null;
    const error = status === 429 ? "Too many verification attempts. Please wait ten minutes and try again. Your draft is still here." : status >= 500 ? "Verification is temporarily unavailable. Please retry; your draft is still here." : "Verification expired or could not be confirmed. Please retry verification; your draft is still here.";
    return securityReply(status, { error, code: "verification_required", verificationRequired: true }, status === 429 ? { "Retry-After": "600" } : {});
  };
  try {
    const missing = !token || token.length > 2048;
    const state = await storeCommand(config, ["EVAL", verificationReservationScript, 3, `${config.prefix}:verify:network:${context.networkHash}`, `${config.prefix}:verify:total`, `${config.prefix}:verify:token:${keyedHash(token, config.CONTACT_HASH_SECRET)}`, missing ? "missing" : "present"], transport);
    if (state === 2) return finish("token_reused", 409);
    if (state === 3) return finish("attempt_limit", 429);
    if (state === 4 || missing) return finish("missing_or_malformed_token", 403);
    if (state !== 1) return finish("store_unavailable", 503);
  } catch { return finish("store_unavailable", 503); }
  try {
    const response = await transport("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", signal: AbortSignal.timeout(6000),
      body: JSON.stringify({ secret: config.TURNSTILE_SECRET_KEY, response: token, idempotency_key: randomUUID(), ...(context.ip === "local" ? {} : { remoteip: context.ip }) }),
    });
    if (!response.ok) return finish("siteverify_unavailable", 503);
    const data = await response.json();
    if (data.success !== true) {
      const codes = Array.isArray(data["error-codes"]) ? data["error-codes"] : [];
      if (codes.includes("internal-error")) return finish("siteverify_unavailable", 503);
      if (codes.some((code: string) => ["missing-input-secret", "invalid-input-secret", "bad-request"].includes(code))) return finish("configuration_error", 503);
      return finish(codes.includes("timeout-or-duplicate") ? "expired_or_used" : "invalid_token", 403);
    }
    if (data.hostname !== context.hostname || !config.hostnames.includes(data.hostname)) return finish("hostname_mismatch", 403);
    if (data.action !== action) return finish("action_mismatch", 403);
    const age = now() - Date.parse(data.challenge_ts);
    if (!Number.isFinite(age) || age < -30000 || age > 300000) return finish("expired_challenge", 403);
    return finish("verified", 200);
  } catch { return finish("siteverify_unavailable", 503); }
}

export function sameOrigin(request: Request, environment: Environment = process.env) {
  const url = new URL(request.url);
  const expected = `${environment.VERCEL ? "https:" : url.protocol}//${request.headers.get("host") ?? url.host}`;
  return request.headers.get("origin") === expected && request.headers.get("sec-fetch-site") !== "cross-site";
}

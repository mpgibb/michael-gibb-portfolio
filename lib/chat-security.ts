import { projectId } from "./experience/schema.ts";
import { randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { boundedJson, keyedHash, requestContext, securityConfiguration, securityReply, storeCommand, verifyTurnstile, recordSecurity, securityLogger, type Environment, type SecurityConfig, type RequestContext, type SecurityLogger } from "./request-security.ts";

const COOKIE = "__Host-portfolio-chat";
const sessionSeconds = 900;
export const chatMessageSchema = z.object({ requestId: z.string().uuid(), message: z.string().trim().min(1).max(2000), mode: z.enum(["executive", "technical"]).default("executive"), projectId: projectId.optional() }).strict();
const initSchema = z.object({ turnstileToken: z.string().max(2048).default("") }).strict();
type Dependencies = { environment?: Environment; transport?: typeof fetch; logger?: SecurityLogger; now?: () => number };
const cookie = (value: string, seconds: number) => `${COOKIE}=${value}; Path=/; Max-Age=${seconds}; Secure; HttpOnly; SameSite=Strict`;
const rechallenge = () => securityReply(401, { error: "Please verify again to continue. Your message is still here.", code: "verification_required", verificationRequired: true }, { "Set-Cookie": cookie("", 0) });
const unavailable = () => securityReply(503, { error: "The assistant is temporarily unavailable. Please retry; your draft is still here." });

// Session creation is bounded independently of challenge attempts. A network
// can start at most five sessions/hour; fresh challenges do not reset AI caps.
export const createSessionScript = `
local count = tonumber(redis.call('GET', KEYS[1]) or '0')
if count >= 5 then return 0 end
if redis.call('INCR', KEYS[1]) == 1 then redis.call('EXPIRE', KEYS[1], 3600) end
redis.call('HSET', KEYS[2], 'network', ARGV[1], 'expires', ARGV[2], 'messages', 0)
redis.call('EXPIRE', KEYS[2], ARGV[3])
return 1
`;

export function createChatSessionHandler({ environment = process.env, transport = fetch, logger = securityLogger, now = Date.now }: Dependencies = {}) {
  return async (request: Request): Promise<Response> => {
    const config = securityConfiguration(environment);
    if (!config) return unavailable();
    const context = requestContext(request, environment, config);
    if (!context) return securityReply(403, { error: "Reload this page to continue." });
    if (!request.headers.get("content-type")?.startsWith("application/json")) return securityReply(415, { error: "Use the assistant to continue." });
    let input;
    try { input = initSchema.safeParse(await boundedJson(request, 3000)); } catch { return securityReply(400, { error: "The verification request could not be read." }); }
    if (!input.success) return securityReply(400, { error: "The verification request could not be read." });
    const result = await verifyTurnstile({ token: input.data.turnstileToken, action: "chat_init", config, context, transport, logger, now });
    if (result) return result;
    const credential = randomBytes(32).toString("base64url");
    const key = `${config.prefix}:session:${keyedHash(credential, config.CONTACT_HASH_SECRET)}`;
    try {
      const accepted = await storeCommand(config, ["EVAL", createSessionScript, 2, `${config.prefix}:sessions:network:${context.networkHash}`, key, context.networkHash, now() + sessionSeconds * 1000, sessionSeconds], transport);
      if (accepted !== 1) return securityReply(429, { error: "The assistant session limit was reached. Please try again later; your draft is still here." }, { "Retry-After": "3600" });
      return securityReply(200, { verified: true, expiresIn: sessionSeconds }, { "Set-Cookie": cookie(credential, sessionSeconds) });
    } catch { return unavailable(); }
  };
}

// Authorization, replay protection, single-flight, message/rate limits and a
// pessimistic token reservation are ONE transaction across all instances.
// Usage remains reserved on failure/cancellation: an upstream may have charged.
export const authorizeMessageScript = `
local expires = tonumber(redis.call('HGET', KEYS[1], 'expires') or '0')
if expires <= tonumber(ARGV[1]) then return 1 end
if redis.call('HGET', KEYS[1], 'network') ~= ARGV[2] then redis.call('DEL', KEYS[1]); return 1 end
local count = tonumber(redis.call('HGET', KEYS[1], 'messages') or '0')
if count >= 20 then redis.call('DEL', KEYS[1]); return 1 end
if redis.call('EXISTS', KEYS[5]) == 1 then return 2 end
if tonumber(redis.call('HGET', KEYS[1], 'busy_until') or '0') > tonumber(ARGV[1]) then return 3 end
local minute = tonumber(redis.call('GET', KEYS[2]) or '0')
if minute >= 3 then redis.call('DEL', KEYS[1]); return 4 end
if tonumber(redis.call('GET', KEYS[3]) or '0') >= 30 then return 5 end
if tonumber(redis.call('GET', KEYS[4]) or '0') >= tonumber(ARGV[3]) then return 6 end
if tonumber(redis.call('GET', KEYS[6]) or '0') + tonumber(ARGV[4]) > tonumber(ARGV[5]) then return 6 end
if redis.call('INCR', KEYS[2]) == 1 then redis.call('EXPIRE', KEYS[2], 60) end
if redis.call('INCR', KEYS[3]) == 1 then redis.call('EXPIRE', KEYS[3], 3600) end
if redis.call('INCR', KEYS[4]) == 1 then redis.call('EXPIRE', KEYS[4], 86400) end
if redis.call('INCRBY', KEYS[6], ARGV[4]) == tonumber(ARGV[4]) then redis.call('EXPIRE', KEYS[6], 86400) end
redis.call('SET', KEYS[5], 'reserved', 'EX', 86400)
redis.call('HINCRBY', KEYS[1], 'messages', 1)
redis.call('HSET', KEYS[1], 'busy_until', tonumber(ARGV[1])+90000, 'operation', ARGV[6])
return 0
`;
export const releaseMessageScript = `
if redis.call('HGET', KEYS[1], 'operation') == ARGV[1] then redis.call('HDEL', KEYS[1], 'busy_until', 'operation') end
return 1
`;

function usageLimits(environment: Environment) {
  const schema = z.object({ AI_DAILY_REQUEST_LIMIT: z.coerce.number().int().min(1).max(1000).default(100), AI_DAILY_TOKEN_LIMIT: z.coerce.number().int().min(10000).max(10000000).default(200000) });
  return schema.safeParse(environment);
}
export type ChatAuthorization = { config: SecurityConfig; context: RequestContext; sessionKey: string; operation: string; input: z.infer<typeof chatMessageSchema> };
// The caller must reserve the complete upper bound of input + output tokens,
// including retrieved context and instructions. No provider call before this.
export async function authorizeChat(request: Request, input: z.infer<typeof chatMessageSchema>, maximumTokens: number, dependencies: Dependencies = {}): Promise<ChatAuthorization | Response> {
  const { environment = process.env, transport = fetch, logger = securityLogger, now = Date.now } = dependencies;
  const started = now();
  const config = securityConfiguration(environment);
  const limits = usageLimits(environment);
  if (!config || !limits.success || !Number.isSafeInteger(maximumTokens) || maximumTokens < 1 || maximumTokens > 30000) return unavailable();
  const context = requestContext(request, environment, config);
  if (!context) return securityReply(403, { error: "Reload this page to continue." });
  const matches = (request.headers.get("cookie") ?? "").split(";").map(value => value.trim()).filter(value => value.startsWith(`${COOKIE}=`));
  const credential = matches.length === 1 ? matches[0].slice(COOKIE.length + 1) : "";
  if (!/^[A-Za-z0-9_-]{43}$/.test(credential)) return rechallenge();
  const sessionKey = `${config.prefix}:session:${keyedHash(credential, config.CONTACT_HASH_SECRET)}`;
  const operation = randomUUID();
  try {
    const state = await storeCommand(config, ["EVAL", authorizeMessageScript, 6, sessionKey, `${sessionKey}:minute`, `${config.prefix}:chat:network:${context.networkHash}`, `${config.prefix}:chat:daily`, `${config.prefix}:chat:request:${keyedHash(input.requestId, config.CONTACT_HASH_SECRET)}`, `${config.prefix}:chat:tokens`, now(), context.networkHash, limits.data.AI_DAILY_REQUEST_LIMIT, maximumTokens, limits.data.AI_DAILY_TOKEN_LIMIT, operation], transport);
    const categories = ["authorized", "session_expired_or_changed", "duplicate_request", "request_in_progress", "session_rate_limit", "network_rate_limit", "usage_cap"];
    recordSecurity(logger, { event: "security_session", action: "chat_message", outcome: state === 0 ? "accepted" : "rejected", category: typeof state === "number" ? categories[state] ?? "invalid_store_response" : "invalid_store_response", latency_ms: Math.max(0, now() - started) });
    if (state === 0) return { config, context, sessionKey, operation, input };
    if (state === 1) return rechallenge();
    if (state === 2 || state === 3) return securityReply(409, { error: "This request has already started. Wait for it to finish before sending another message.", code: "request_in_progress" });
    if (state === 4) return securityReply(429, { error: "Please wait a minute, then verify again. Your message is still here.", code: "verification_required", verificationRequired: true }, { "Set-Cookie": cookie("", 0), "Retry-After": "60" });
    if (state === 5 || state === 6) return securityReply(429, { error: "The assistant usage limit has been reached. Please try again later or use the contact form.", code: "usage_limit" }, { "Retry-After": state === 5 ? "3600" : "86400" });
    return unavailable();
  } catch {
    recordSecurity(logger, { event: "security_session", action: "chat_message", outcome: "unavailable", category: "store_unavailable", latency_ms: Math.max(0, now() - started) });
    return unavailable();
  }
}
export async function releaseChat(authorization: ChatAuthorization, transport = fetch) {
  // Expiring busy_until is the safe fallback if the store is unavailable.
  try { await storeCommand(authorization.config, ["EVAL", releaseMessageScript, 1, authorization.sessionKey, authorization.operation], transport); } catch { /* No limits are refunded. */ }
}

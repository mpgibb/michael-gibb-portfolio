import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";
import { storeCommand, type Environment } from "../request-security.ts";
export function database(env: Environment = process.env, transport: typeof fetch = fetch) {
  if (!env.UPSTASH_REDIS_REST_URL?.startsWith("https://") || !env.UPSTASH_REDIS_REST_TOKEN || (env.CONTACT_HASH_SECRET?.length ?? 0) < 32) throw new Error("storage_unavailable");
  const config = { UPSTASH_REDIS_REST_URL: env.UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN: env.UPSTASH_REDIS_REST_TOKEN };
  const key = Buffer.from(hkdfSync("sha256", env.CONTACT_HASH_SECRET!, "portfolio-v1", "private-records", 32));
  const prefix = `portfolio-experience:${env.VERCEL_ENV ?? "development"}`;
  return {
    prefix, command: (...values: (string | number)[]) => storeCommand(config, values, transport),
    seal(value: unknown) { const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", key, iv); const body = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]); return [iv, cipher.getAuthTag(), body].map(v => v.toString("base64url")).join("."); },
    open<T>(value: string): T { const [iv, tag, body] = value.split(".").map(v => Buffer.from(v, "base64url")); const cipher = createDecipheriv("aes-256-gcm", key, iv); cipher.setAuthTag(tag); return JSON.parse(Buffer.concat([cipher.update(body), cipher.final()]).toString()); },
  };
}
export type Database = ReturnType<typeof database>;
export const boundedSetting = (value: string | undefined, fallback: number, maximum: number) => { const n = Number(value); return Number.isInteger(n) && n > 0 && n <= maximum ? n : fallback; };
export const budgetScript = `
if redis.call('EXISTS', KEYS[2]) == 1 then return 2 end
local value = tonumber(redis.call('GET', KEYS[1]) or '0')
if value + tonumber(ARGV[1]) > tonumber(ARGV[2]) then return 0 end
redis.call('INCRBY', KEYS[1], ARGV[1]); redis.call('EXPIRE', KEYS[1], 86400)
redis.call('SET', KEYS[2], '1', 'EX', 86400)
return 1`;

import { database } from "./store.ts";
import type { Environment } from "../request-security.ts";
export async function recordOperation(data: { outcome: "complete" | "failed" | "cancelled"; tokens: number; micros: number; latency: number }, env: Environment, transport: typeof fetch) {
  try { const db = database(env, transport); await db.command("EVAL", `redis.call('HINCRBY',KEYS[1],ARGV[1],1);redis.call('HINCRBY',KEYS[1],'tokens',ARGV[2]);redis.call('HINCRBY',KEYS[1],'estimated_microdollars',ARGV[3]);redis.call('HINCRBY',KEYS[1],'latency_ms_total',ARGV[4]);redis.call('EXPIRE',KEYS[1],2592000);return 1`, 1, `${db.prefix}:operations:${new Date().toISOString().slice(0,10)}`, data.outcome, Math.max(0,Math.round(data.tokens)), Math.max(0,Math.round(data.micros)), Math.max(0,Math.round(data.latency))); } catch { console.warn("assistant_operations_unavailable"); }
}

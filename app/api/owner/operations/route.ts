import { ownerSession } from "@/lib/experience/auth";
import { database } from "@/lib/experience/store";
import { securityReply } from "@/lib/request-security";
export async function GET() {
  if (!await ownerSession()) return securityReply(401, {});
  try {
    const db = database(); const days = Array.from({ length:30 }, (_, i) => new Date(Date.now()-i*86400000).toISOString().slice(0,10));
    const rows = await db.command("EVAL", `local out={};for _,key in ipairs(KEYS) do table.insert(out,redis.call('HGETALL',key)) end;return out`, days.length, ...days.map(day => `${db.prefix}:operations:${day}`));
    return securityReply(200, { days: Array.isArray(rows) ? rows.map((row, i) => ({ day:days[i], ...Object.fromEntries(Array.from({length:row.length/2},(_,n)=>[row[n*2],Number(row[n*2+1])])) })) : [], note:"Essential aggregate operations include non-consenting requests. Incomplete/cancelled usage may be unknown; reserved budgets remain consumed. Estimated cost is not an invoice." });
  } catch { return securityReply(503, {}); }
}

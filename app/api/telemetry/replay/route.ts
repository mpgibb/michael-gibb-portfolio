import { sameOrigin } from "@/lib/request-security";
import { readConsent, trackingAllowed } from "@/lib/experience/consent";
import { database, budgetScript } from "@/lib/experience/store";
export async function POST(request: Request) {
  const consent = readConsent(request);
  if (!sameOrigin(request) || !trackingAllowed(consent, process.env) || !consent?.replay || process.env.REPLAY_ENABLED !== "true" || request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1" || request.headers.get("cookie")?.includes("portfolio-owner-exclude=1")) return Response.json({ record: false });
  const rate = Math.min(.1, Math.max(0, Number(process.env.REPLAY_SAMPLE_RATE ?? .1)));
  if (Math.random() > rate) return Response.json({ record: false });
  try { const db = database(); const result = await db.command("EVAL", budgetScript, 2, `${db.prefix}:replay:${new Date().toISOString().slice(0,10)}`, `${db.prefix}:replay-session:${consent.session}`, 1, 10); return Response.json({ record: result === 1 || result === 2 }); } catch { return Response.json({ record: false }); }
}

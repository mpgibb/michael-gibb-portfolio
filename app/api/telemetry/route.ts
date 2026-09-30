import { sameOrigin } from "@/lib/request-security";
import { z } from "zod";
import { boundedJson, securityReply } from "@/lib/request-security";
import { readConsent, trackingAllowed } from "@/lib/experience/consent";
import { eventSchema, serverEvents } from "@/lib/experience/schema";
import { recordEvent } from "@/lib/experience/analytics-server";
import { database, budgetScript } from "@/lib/experience/store";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request) || /bot|crawler|spider|headless/i.test(request.headers.get("user-agent") ?? "") || request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1") return new Response(null, { status: 204 });
  const consent = readConsent(request);
  if (!trackingAllowed(consent, process.env) || !consent || /(?:^|;\s*)portfolio-owner-exclude=1(?:;|$)/.test(request.headers.get("cookie") ?? "")) return new Response(null, { status: 204 });
  try {
    const events = z.array(eventSchema).min(1).max(10).parse(await boundedJson(request, 12000));
    if (events.some(event => serverEvents.has(event.name) || Math.abs(Date.now() - Date.parse(event.time)) > 300000)) return securityReply(400, {});
    const db = database();
    for (const event of events) {
      const allowed = await db.command("EVAL", budgetScript, 2, `${db.prefix}:browser-events:${consent.browser}:${new Date().toISOString().slice(0,10)}`, `${db.prefix}:browser-event:${event.id}`, 1, 150);
      if (allowed === 1) { const country = request.headers.get("x-vercel-ip-country"); delete event.properties.country; if (process.env.VERCEL && country && /^[A-Z]{2}$/.test(country)) event.properties.country = country; await recordEvent(event, consent); }
    }
    return new Response(null, { status: 204 });
  } catch { return new Response(null, { status: 204 }); }
}

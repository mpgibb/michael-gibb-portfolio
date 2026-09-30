import { sameOrigin } from "@/lib/request-security";
import { database } from "@/lib/experience/store";
import { z } from "zod";
import { boundedJson, securityReply } from "@/lib/request-security";
import { consentCookie, newConsent, readConsent } from "@/lib/experience/consent";
import { attributionSchema } from "@/lib/experience/schema";
import { serverEvent } from "@/lib/experience/analytics-server";
export const runtime = "nodejs";
export async function GET(request: Request) { const preference = readConsent(request); return securityReply(200, { preference, config: { enabled: process.env.VERCEL_ENV === "production" && process.env.ANALYTICS_ENABLED === "true", replay: process.env.REPLAY_ENABLED === "true", token: process.env.POSTHOG_PROJECT_TOKEN, host: process.env.POSTHOG_HOST } }); }
export async function POST(request: Request) {
  if (!sameOrigin(request)) return securityReply(403, {});
  try {
    const data = z.object({ analytics: z.boolean(), replay: z.boolean(), attribution: attributionSchema.optional() }).strict().parse(await boundedJson(request, 1500));
    if (request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1") { data.analytics = false; data.replay = false; }
    const previous = readConsent(request);
    const preference = newConsent(data.analytics, data.replay, previous, data.attribution);
    if (!data.analytics && previous?.browser) { const db = database(); await db.command("SET", `${db.prefix}:withdrawn:${previous.browser}`, "1", "EX", 15552000); if (previous.session) await db.command("DEL", `${db.prefix}:journey:${previous.session}`); }
    const cookie = consentCookie(preference);
    await serverEvent("consent_change", preference, { analytics: preference.analytics, replay: preference.replay, version: 1 });
    return securityReply(200, { preference }, { "Set-Cookie": cookie });
  } catch { return securityReply(503, { error: "Preferences could not be saved. Optional tracking remains off. Please retry." }); }
}

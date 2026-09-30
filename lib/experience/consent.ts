import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import { z } from "zod";
import type { Environment } from "../request-security.ts";
import { attributionSchema } from "./schema.ts";
export const consentSchema = z.object({ version: z.literal(1), analytics: z.boolean(), replay: z.boolean(), expires: z.number(), browser: z.string().uuid().optional(), session: z.string().uuid().optional(), sessionExpires: z.number().optional(), attribution: attributionSchema.optional() }).strict();
export type Consent = z.infer<typeof consentSchema>;
export const CONSENT_COOKIE = "portfolio-preferences";
export function readConsent(request: Request, env: Environment = process.env): Consent | null {
  try {
    if ((env.CONTACT_HASH_SECRET?.length ?? 0) < 32) return null;
    const cookie = request.headers.get("cookie")?.split(";").map(v => v.trim()).find(v => v.startsWith(`${CONSENT_COOKIE}=`))?.slice(CONSENT_COOKIE.length + 1);
    if (!cookie || cookie.length > 2500) return null;
    const [body, sig] = cookie.split("."); const expected = createHmac("sha256", env.CONTACT_HASH_SECRET!).update(body).digest(); const actual = Buffer.from(sig, "base64url");
    if (expected.length !== actual.length || !timingSafeEqual(actual, expected)) return null;
    const value = consentSchema.parse(JSON.parse(Buffer.from(body, "base64url").toString()));
    return value.expires > Date.now() ? value : null;
  } catch { return null; }
}
export function consentCookie(consent: Consent, env: Environment = process.env) {
  if ((env.CONTACT_HASH_SECRET?.length ?? 0) < 32) throw new Error("preferences_unavailable");
  const body = Buffer.from(JSON.stringify(consentSchema.parse(consent))).toString("base64url"); const sig = createHmac("sha256", env.CONTACT_HASH_SECRET!).update(body).digest("base64url");
  return `${CONSENT_COOKIE}=${body}.${sig}; Path=/; HttpOnly; ${env.NODE_ENV === "development" ? "" : "Secure; "}SameSite=Lax; Max-Age=15552000`;
}
export function newConsent(analytics: boolean, replay: boolean, previous: Consent | null, attribution?: Consent["attribution"]): Consent {
  return { version: 1, analytics, replay: analytics && replay, expires: Date.now() + 15552000000, ...(analytics ? { browser: previous?.analytics ? previous.browser ?? randomUUID() : randomUUID(), session: previous?.analytics && (previous.sessionExpires ?? 0) > Date.now() ? previous.session ?? randomUUID() : randomUUID(), sessionExpires: Date.now() + 1800000, attribution: previous?.analytics && (previous.sessionExpires ?? 0) > Date.now() ? previous.attribution : attribution } : {}) };
}
export const trackingAllowed = (consent: Consent | null, env: Environment) => env.VERCEL_ENV === "production" && env.ANALYTICS_ENABLED === "true" && !!consent?.analytics && !!consent.browser && !!consent.session && (consent.sessionExpires ?? 0) > Date.now();

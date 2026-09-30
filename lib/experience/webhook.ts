import { Webhook } from "svix";
import { z } from "zod";
import { database } from "./store.ts";
import { updateInquiry } from "./inquiries.ts";
import { securityReply } from "../request-security.ts";
export function createDeliveryWebhook(env: Record<string,string | undefined> = process.env, transport: typeof fetch = fetch) { return async function POST(request: Request) {
  if (!env.RESEND_WEBHOOK_SECRET || env.VERCEL_ENV !== "production") return securityReply(503, {});
  if (Number(request.headers.get("content-length")) > 20000) return securityReply(413, {});
  let event;
  try {
    const reader = request.body?.getReader(); if (!reader) return securityReply(400, {});
    let raw = Buffer.alloc(0);
    while (true) { const { value, done } = await reader.read(); if (done) break; raw = Buffer.concat([raw, value]); if (raw.length > 20000) { await reader.cancel(); return securityReply(413, {}); } }
    new Webhook(env.RESEND_WEBHOOK_SECRET).verify(raw.toString(), { "svix-id": request.headers.get("svix-id") ?? "", "svix-timestamp": request.headers.get("svix-timestamp") ?? "", "svix-signature": request.headers.get("svix-signature") ?? "" });
    event = z.object({ type: z.string(), data: z.object({ email_id: z.string().max(100) }) }).parse(JSON.parse(raw.toString()));
  } catch { return securityReply(400, {}); }
  if (!["email.delivered", "email.bounced"].includes(event.type)) return securityReply(200, {});
  try {
    const db = database(env, transport); const id = await db.command("GET", `${db.prefix}:provider:${event.data.email_id}`);
    // Provider may beat the contact response: retry until mapping is committed.
    if (typeof id !== "string") return securityReply(503, {});
    await updateInquiry(id, event.type === "email.delivered" ? "email_delivered" : "email_bounced", event.data.email_id, env, transport);
    return securityReply(200, {});
  } catch { return securityReply(503, {}); }
}

}

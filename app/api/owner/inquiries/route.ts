import { ownerSession } from "@/lib/experience/auth";
import { listInquiries } from "@/lib/experience/inquiries";
import { securityReply } from "@/lib/request-security";
export const runtime = "nodejs";
export async function GET(request: Request) { if (!await ownerSession()) return securityReply(401, { error: "Sign in as the owner." }); try { return securityReply(200, { inquiries: await listInquiries(process.env, Math.min(10000, Math.max(0, Number(new URL(request.url).searchParams.get("offset")) || 0))) }); } catch { return securityReply(503, { error: "Inbox temporarily unavailable." }); } }

import { sameOrigin } from "@/lib/request-security";
import { z } from "zod";
import { ownerSession } from "@/lib/experience/auth";
import { deleteInquiry } from "@/lib/experience/inquiries";
import { securityReply } from "@/lib/request-security";
export const runtime = "nodejs";
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await ownerSession()) return securityReply(401, {});
  if (!sameOrigin(request)) return securityReply(403, {});
  const id = z.string().uuid().safeParse((await params).id); if (!id.success) return securityReply(400, {});
  try { await deleteInquiry(id.data); return securityReply(200, { deleted: true, note: "Local records deleted. Any linked PostHog deletion is queued, not yet verified complete; check provider deletion status. Mailbox copies require separate review." }); } catch { return securityReply(409, { error: "Delete linked PostHog events and replays first using the documented privacy procedure, then retry. The record remains available." }); }
}

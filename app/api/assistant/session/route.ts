import { createChatSessionHandler } from "@/lib/chat-security";
import { assistantEnabled } from "@/lib/experience/assistant";
import { securityReply } from "@/lib/request-security";
export const runtime = "nodejs";
export const POST = (request: Request) => assistantEnabled() ? createChatSessionHandler()(request) : securityReply(503, { error: "The assistant is not available yet. Direct contact is still available." });

import { authorizeChat, chatMessageSchema, releaseChat, type ChatAuthorization } from "./chat-security.ts";
import { boundedJson, securityReply, type Environment, type SecurityLogger } from "./request-security.ts";

// Every AI operation (answers, summaries and draft generation) must enter here.
// The provider adapter is deliberately injected so a security rejection cannot
// accidentally make a billable call. Streaming adapters release in stream.finally.
export function createProtectedChatHandler({ execute, maximumTokens, environment = process.env, transport = fetch, logger, now, releaseOnReturn = true }: {
  execute: (authorization: ChatAuthorization, signal: AbortSignal) => Promise<Response>;
  maximumTokens: number; environment?: Environment; transport?: typeof fetch; logger?: SecurityLogger; now?: () => number; releaseOnReturn?: boolean;
}) {
  return async (request: Request): Promise<Response> => {
    if (request.signal.aborted) return securityReply(499, { error: "Request cancelled. Your draft is still here." });
    if (!request.headers.get("content-type")?.startsWith("application/json")) return securityReply(415, { error: "Use the assistant to send your message." });
    let data;
    try { data = chatMessageSchema.safeParse(await boundedJson(request, 10000)); } catch { return securityReply(400, { error: "The message could not be read. Your draft is still here." }); }
    if (!data.success) return securityReply(400, { error: "Keep your message between 1 and 2,000 characters." });
    const authorization = await authorizeChat(request, data.data, maximumTokens, { environment, transport, logger, now });
    if (authorization instanceof Response) return authorization;
    try {
      if (request.signal.aborted) return securityReply(499, { error: "Request cancelled. Your draft is still here." });
      return await execute(authorization, AbortSignal.any([request.signal, AbortSignal.timeout(60000)]));
    }
    catch { return securityReply(503, { error: "The assistant could not complete that request. Your message is still here." }); }
    finally { if (releaseOnReturn) await releaseChat(authorization, transport); }
  };
}

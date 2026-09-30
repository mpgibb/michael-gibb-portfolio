import { recordOperation } from "./operations.ts";
import { randomUUID } from "node:crypto";
import { createProtectedChatHandler } from "../protected-chat.ts";
import { releaseChat } from "../chat-security.ts";
import { securityReply, type Environment } from "../request-security.ts";
import { assistantInstructions, retrieve, knowledgeVersion } from "./retrieval.ts";
import { readConsent } from "./consent.ts";
import { serverEvent } from "./analytics-server.ts";
import { database, budgetScript, boundedSetting } from "./store.ts";
import { intentOf } from "./schema.ts";
export const assistantEnabled = (env: Environment = process.env) => env.AI_ENABLED === "true" && !!env.OPENAI_API_KEY && env.VERCEL_ENV !== "preview";
// Byte ceilings are conservative token ceilings, plus framing and output headroom.
export const MAX_INPUT_BYTES = 12000;
export const MAX_OUTPUT_TOKENS = 2000;
export const RESERVED_TOKENS = MAX_INPUT_BYTES + MAX_OUTPUT_TOKENS + 1024;
export async function* responseEvents(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader(); const decoder = new TextDecoder(); let buffer = "";
  try { while (true) { const { done, value } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n"); if (buffer.length > 2000000) throw new Error("provider_protocol"); let end; while ((end = buffer.indexOf("\n\n")) !== -1) { const frame = buffer.slice(0, end); buffer = buffer.slice(end + 2); const data = frame.split("\n").filter(line => line.startsWith("data:")).map(line => line.slice(5).trimStart()).join("\n"); if (data && data !== "[DONE]") yield JSON.parse(data); } } } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
export function createAssistantHandler(env: Environment = process.env, transport: typeof fetch = fetch) {
  return async (request: Request) => {
    if (!assistantEnabled(env)) return securityReply(503, { error: "The AI assistant is not available yet. You can browse the research catalogue or contact Michael directly." });
    const consent = request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1" || request.headers.get("cookie")?.includes("portfolio-owner-exclude=1") ? null : readConsent(request, env);
    return createProtectedChatHandler({ environment: env, transport, maximumTokens: RESERVED_TOKENS, releaseOnReturn: false, execute: async (authorization, signal) => {
      const { input, sessionKey, operation } = authorization; const db = database(env, transport);
      const historyKey = `${sessionKey}:context`; const raw = await db.command("GET", historyKey);
      const history = typeof raw === "string" ? db.open<{ turns: { role: "user" | "assistant"; content: string }[]; conversation: string; projectId?: string }>(raw) : { turns: [], conversation: randomUUID() };
      const followup = /^(what (are|were|is|does|did)|what about|how|why|and|explain (this|that)|tell me more)/i.test(input.message);
      const sources = retrieve(input.message, input.projectId ?? (followup ? history.projectId : undefined));
      const prompt = { mode: input.mode, evidence: sources, previousConversation: history.turns.slice(-4), visitor: input.message };
      let content = JSON.stringify(prompt);
      // Bound total request context without truncating the visitor's message.
      while (Buffer.byteLength(assistantInstructions + content) > MAX_INPUT_BYTES && prompt.previousConversation.length) { prompt.previousConversation.shift(); content = JSON.stringify(prompt); }
      while (Buffer.byteLength(assistantInstructions + content) > MAX_INPUT_BYTES && prompt.evidence.length) { prompt.evidence.pop(); content = JSON.stringify(prompt); }
      if (Buffer.byteLength(assistantInstructions + content) > MAX_INPUT_BYTES) { await releaseChat(authorization, transport); return securityReply(400, { error: "Please shorten your message." }); }
      const reservationMicros = 8000; // $0.008 > 12k input × $0.25/M + 2k output × $2/M.
      const permitted = await db.command("EVAL", budgetScript, 2, `${db.prefix}:ai-cost:${new Date().toISOString().slice(0,10)}`, `${db.prefix}:ai-cost-operation:${operation}`, reservationMicros, boundedSetting(env.AI_DAILY_COST_MICRODOLLARS, 500000, 5000000));
      if (permitted !== 1) { await releaseChat(authorization, transport); return securityReply(429, { error: "The assistant’s daily usage allowance has been reached. Please contact Michael directly or try again tomorrow." }); }
      const started = Date.now(); const controller = new AbortController(); const combined = AbortSignal.any([signal, controller.signal]); const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(output) {
          let text = ""; let complete = false;
          const send = (type: string, data: unknown) => { if (!combined.aborted) output.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`)); };
          try {
            await serverEvent("conversation_start", consent, { conversation_id: history.conversation }, history.conversation, env, transport);
            send("sources", prompt.evidence.map(({ id, title, status, url, version }) => ({ id, title, status, url, version })));
            if (!prompt.evidence.length) {
              text = "I don’t have published evidence to answer that question. Try a specific study, business problem or method, or use Contact Michael to prepare an inquiry.";
              send("delta", { text }); complete = true;
              await serverEvent("response_complete", consent, { conversation_id: history.conversation, category: "empty", intent: intentOf(input.message), count: 0, tokens: 0, cost_usd: 0 }, operation, env, transport);
            } else {
              const response = await transport("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "gpt-5-mini", instructions: assistantInstructions, input: content, max_output_tokens: MAX_OUTPUT_TOKENS, reasoning: { effort: "low" }, store: false, stream: true }), signal: combined, cache: "no-store" });
              if (!response.ok || !response.body) throw new Error("provider");
              for await (const event of responseEvents(response.body)) {
                if (event.type === "response.output_text.delta" && typeof event.delta === "string") { text += event.delta; if (text.length > 16000) throw new Error("provider"); send("delta", { text: event.delta }); }
                if (["error", "response.failed", "response.incomplete"].includes(event.type)) throw new Error("provider");
                if (event.type === "response.completed") {
                  complete = true; const usage = event.response?.usage ?? {}; const inputTokens = Number(usage.input_tokens ?? 0); const outputTokens = Number(usage.output_tokens ?? 0);
                  await recordOperation({ outcome:"complete", tokens: inputTokens + outputTokens, micros: inputTokens * .25 + outputTokens * 2, latency:Date.now()-started }, env, transport);
                  await serverEvent("response_complete", consent, { conversation_id: history.conversation, category: input.mode, intent: intentOf(input.message), count: prompt.evidence.length, model: "gpt-5-mini", model_version: /^gpt-5-mini(?:-\d{4}-\d{2}-\d{2})?$/.test(event.response?.model ?? "") ? event.response.model : undefined, tokens: inputTokens + outputTokens, cost_usd: (inputTokens * .25 + outputTokens * 2) / 1e6, latency_ms: Date.now() - started }, operation, env, transport);
                }
              }
            }
            if (!complete) throw new Error("provider");
            const turns = [...history.turns, { role: "user" as const, content: input.message }, { role: "assistant" as const, content: text.slice(0,3000) }].slice(-4);
            const expiry = Number(await db.command("HGET", sessionKey, "expires")); const ttl = Math.min(900, Math.floor((expiry - Date.now()) / 1000));
            if (ttl > 0) await db.command("SET", historyKey, db.seal({ turns, conversation: history.conversation, projectId: input.projectId ?? prompt.evidence[0]?.id }), "EX", ttl);
            send("done", { version: knowledgeVersion, conversation: history.conversation });
          } catch {
            const category = combined.aborted ? signal.reason?.name === "TimeoutError" ? "timeout" : "cancelled" : "provider";
            await recordOperation({ outcome:category === "cancelled" ? "cancelled" : "failed", tokens:0, micros:0, latency:Date.now()-started }, env, transport);
            await serverEvent(category === "cancelled" ? "response_cancelled" : "response_failed", consent, { conversation_id: history.conversation, category, latency_ms: Math.min(120000, Date.now()-started) }, operation, env, transport);
            send("error", { error: "The response could not be completed. Your message is still here. Retry or contact Michael directly." });
          } finally { await releaseChat(authorization, transport); try { output.close(); } catch { /* Visitor cancelled. */ } }
        },
        cancel() { controller.abort(); },
      });
      return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-store, no-transform", "X-Accel-Buffering": "no", "X-Robots-Tag": "noindex" } });
    } })(request);
  };
}

"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";

type Turnstile = { render: (element: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void };
declare global { interface Window { turnstile?: Turnstile } }
let loading: Promise<Turnstile> | undefined;
function loadTurnstile(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loading) return loading;
  // Load only after a send action, independently of optional analytics consent.
  // A failed load is removed so an explicit retry can actually load it again.
  loading = new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement("script");
    const fail = () => { clearTimeout(timeout); script.remove(); loading = undefined; reject(new Error("verification_unavailable")); };
    const timeout = setTimeout(fail, 15000);
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onerror = fail;
    script.onload = () => { clearTimeout(timeout); if (window.turnstile) resolve(window.turnstile); else fail(); };
    document.head.appendChild(script);
  });
  return loading;
}

export type VerificationHandle = { verify: () => Promise<string> };
export function TurnstileVerification({ action, ref }: { action: "contact_submit" | "chat_init"; ref: Ref<VerificationHandle> }) {
  const [attempt, setAttempt] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  const pending = useRef<{ resolve: (token: string) => void; reject: (error: Error) => void } | null>(null);
  useImperativeHandle(ref, () => ({ verify: () => {
    pending.current?.reject(new Error("verification_restarted"));
    const promise = new Promise<string>((resolve, reject) => { pending.current = { resolve, reject }; });
    setAttempt(previous => previous + 1);
    return promise;
  } }), []);
  useEffect(() => {
    if (!attempt) return;
    let active = true;
    let widget: string | undefined;
    let api: Turnstile | undefined;
    const fail = () => { if (active) { pending.current?.reject(new Error("verification_unavailable")); pending.current = null; } };
    const timer = setTimeout(fail, 120000);
    loadTurnstile().then(value => {
      if (!active || !container.current) return;
      api = value;
      widget = value.render(container.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        action, theme: "auto", size: container.current.clientWidth < 300 ? "compact" : "flexible",
        appearance: "interaction-only", execution: "render", retry: "never",
        "refresh-expired": "manual", "refresh-timeout": "manual", "response-field": false,
        callback: (token: string) => { if (active) { clearTimeout(timer); pending.current?.resolve(token); pending.current = null; } },
        "error-callback": () => { fail(); return true; }, "expired-callback": fail, "timeout-callback": fail,
      });
    }).catch(fail);
    return () => { active = false; clearTimeout(timer); if (widget && api) api.remove(widget); };
  }, [action, attempt]);
  useEffect(() => () => { pending.current?.reject(new Error("verification_cancelled")); pending.current = null; }, []);
  return <div className="verification-container" ref={container} aria-label="Security verification" />;
}

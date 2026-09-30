"use client";
import type { Consent } from "./consent";
import { canonicalPath } from "./schema.ts";
let generation = 0;
let client: typeof import("posthog-js")["default"] | null = null;
export async function stopReplay() { generation++; if (client) { client.stopSessionRecording(); client.opt_out_capturing(); client.reset(); client = null; } }
// Recursively strip URL queries/fragments and text from uncompressed replay data.
// Never forward compressed or otherwise uninspectable snapshots.
export function cleanReplay(value: unknown, key = ""): unknown {
  if (/textContent|text|value|placeholder|title|alt|aria-label|data-.*|style/i.test(key)) return "***";
  if (/href|src|url|referrer/i.test(key) && typeof value === "string") return `https://michaelpgibb.com${canonicalPath(value)}`;
  if (Array.isArray(value)) return value.map(v => cleanReplay(v));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, cleanReplay(v,k)]));
  return value;
}
export async function startReplay(consent: Consent, config: { enabled: boolean; replay: boolean; token?: string; host?: string }) {
  const current = ++generation;
  if (!config.enabled || !config.replay || !consent.analytics || !consent.replay || !config.token || !config.host || location.pathname.startsWith("/owner") || navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
  try {
    const allowed = await fetch("/api/telemetry/replay", { method: "POST" }).then(r => r.ok ? r.json() : null);
    if (!allowed?.record || current !== generation) return;
    const posthog = (await import("posthog-js")).default; if (current !== generation) return;
    posthog.init(config.token, { api_host: config.host, autocapture: false, capture_pageview: false, capture_pageleave: false, person_profiles: "always", persistence: "memory", bootstrap: { distinctID: consent.browser, isIdentifiedID: false }, disable_surveys: true, disable_session_recording: true, capture_performance: false, enable_recording_console_log: false, capture_heatmaps: true, ip: false,
      session_recording: { captureJsonLd: false, maskAllElementAttributes: true, maskAllInputs: true, maskTextSelector: "*", blockSelector: ".contact-form, .assistant-transcript, .inquiry-preview, [data-private], .owner-inbox", recordHeaders: false, recordBody: false, recordCrossOriginIframes: false },
      before_send(event) {
        if (!event || current !== generation || location.pathname.startsWith("/owner")) return null;
        if (!["$snapshot", "$heatmaps", "$rageclick", "$dead_click"].includes(event.event)) return null;
        if (event.event === "$snapshot" && !Array.isArray(event.properties.$snapshot_data)) return null;
        event.properties = { ...cleanReplay(event.properties) as Record<string, unknown>, distinct_id: consent.browser, portfolio_session_id: consent.session, $geoip_disable: true, $ip: null, $current_url: `https://michaelpgibb.com${canonicalPath(location.pathname)}` };
        return event;
      },
      loaded(instance) { if (current !== generation) { instance.opt_out_capturing(); return; } instance.register({ portfolio_session_id: consent.session, $geoip_disable: true }); instance.startSessionRecording(); },
    });
    client = posthog;
  } catch { /* Optional replay never affects the page. */ }
}

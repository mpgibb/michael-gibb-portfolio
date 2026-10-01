"use client";
import type { Consent } from "./consent";
import { canonicalPath } from "./schema.ts";
let generation = 0;
let client: typeof import("posthog-js")["default"] | null = null;
export async function stopReplay() { generation++; if (client) { client.stopSessionRecording(); client.opt_out_capturing(); client.reset(); client = null; } }
function replayUrl(value: string) {
  try {
    const url = new URL(value, "https://michaelpgibb.com");
    if (url.origin === "https://michaelpgibb.com" && /^\/(?:_next\/static\/|brand\/)[a-zA-Z0-9_./-]+$/.test(url.pathname)) return `${url.origin}${url.pathname}`;
  } catch { /* Fall back to an approved public route. */ }
  return `https://michaelpgibb.com${canonicalPath(value)}`;
}
function cleanCss(value: string) {
  // CSS comes from the public application, not visitor input. Remove generated
  // content and external resource values while preserving layout declarations.
  return value.replace(/\bcontent\s*:[^;}]+/gi, 'content:""').replace(/url\([^)]*\)/gi, 'url("")').replace(/@import[^;]+;/gi, "");
}
export function replayAttribute(name: string, value: string) {
  if (/^(class|id)$/.test(name) && /^[a-zA-Z0-9_:\-\s]*$/.test(value)) return value;
  if (name === "style") return cleanCss(value);
  if (/^(href|src)$/.test(name)) return replayUrl(value);
  if (/^(type|rel|media|width|height|viewBox|d|fill|stroke|role|aria-hidden|tabindex)$/.test(name)) return value;
  return "***";
}
// Recursively strip URL queries/fragments and text from uncompressed replay data.
// Never forward compressed or otherwise uninspectable snapshots.
export function cleanReplay(value: unknown, key = ""): unknown {
  if (typeof value === "string" && /^(style|cssText|_cssText|rule)$/.test(key)) return cleanCss(value);
  if (typeof value === "string" && /^(textContent|text|value|placeholder|title|alt|aria-label)$|^data-/i.test(key)) return value.replace(/\S/g, "*");
  if (typeof value === "string" && /^(href|src|url|referrer)$|^\$(current_url|referrer|session_entry_url)$/.test(key)) return replayUrl(value);
  if (Array.isArray(value)) return value.map(v => cleanReplay(v));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k,v]) => [/^https?:\/\//.test(k) ? replayUrl(k) : k, k === "textContent" && "isStyle" in value && value.isStyle === true && typeof v === "string" ? cleanCss(v) : cleanReplay(v,k)]));
  return value;
}
export function inspectableSnapshots(value: unknown): boolean {
  return Array.isArray(value) && value.every(frame => frame && typeof frame === "object" && !("cv" in frame) && typeof frame.data !== "string");
}
const replayProperties = new Set(["token", "$snapshot_data", "$snapshot_bytes", "$snapshot_source", "$session_id", "$window_id", "$lib", "$lib_version", "$browser", "$browser_version", "$device_type", "$os", "$os_version", "$screen_width", "$screen_height", "$viewport_width", "$viewport_height", "$heatmap_data", "$time"]);
export async function startReplay(consent: Consent, config: { enabled: boolean; replay: boolean; token?: string; host?: string }) {
  const current = ++generation;
  if (!config.enabled || !config.replay || !consent.analytics || !consent.replay || !config.token || !config.host || location.pathname.startsWith("/owner") || navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
  try {
    const allowed = await fetch("/api/telemetry/replay", { method: "POST" }).then(r => r.ok ? r.json() : null);
    if (!allowed?.record || current !== generation) return;
    const posthog = (await import("posthog-js")).default; if (current !== generation) return;
    posthog.init(config.token, { api_host: config.host, autocapture: false, capture_pageview: false, capture_pageleave: false, person_profiles: "always", persistence: "memory", bootstrap: { distinctID: consent.browser, isIdentifiedID: false }, disable_surveys: true, disable_session_recording: true, capture_performance: false, enable_recording_console_log: false, capture_heatmaps: true, ip: false,
      session_recording: { compress_events: false, captureJsonLd: false, maskAllElementAttributes: false, maskAttributeFn: replayAttribute, maskAllInputs: true, maskTextSelector: "*", blockSelector: ".contact-form, .assistant-transcript, .inquiry-preview, [data-private], .owner-inbox", recordHeaders: false, recordBody: false, recordCrossOriginIframes: false },
      before_send(event) {
        if (!event || current !== generation || location.pathname.startsWith("/owner")) return null;
        if (!["$snapshot", "$$heatmap", "$rageclick", "$dead_click"].includes(event.event)) return null;
        if (event.event === "$snapshot" && !inspectableSnapshots(event.properties.$snapshot_data)) return null;
        const permitted = Object.fromEntries(Object.entries(event.properties).filter(([key]) => replayProperties.has(key)));
        event.properties = { ...cleanReplay(permitted) as Record<string, unknown>, distinct_id: consent.browser, portfolio_session_id: consent.session, $geoip_disable: true, $ip: null, $current_url: `https://michaelpgibb.com${canonicalPath(location.pathname)}` };
        return event;
      },
      loaded(instance) { if (current !== generation) { instance.opt_out_capturing(); return; } instance.register({ portfolio_session_id: consent.session, $geoip_disable: true }); instance.startSessionRecording(); },
    });
    client = posthog;
  } catch { /* Optional replay never affects the page. */ }
}

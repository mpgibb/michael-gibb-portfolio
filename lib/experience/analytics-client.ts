"use client";
import { canonicalPath, eventSchema, type Event, type Properties, type Attribution } from "./schema";
let enabled = false;
export function optionalStorageGet(key: string) { try { return localStorage.getItem(key); } catch { return null; } }
export function optionalStorageSet(key: string, value: string | null) { try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch { /* Blocked storage never breaks the visitor workflow. */ } }
export function setTracking(value: boolean) { enabled = value && optionalStorageGet("privacy-withdrawn") !== "1" && !window.location.pathname.startsWith("/owner") && navigator.doNotTrack !== "1" && !(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl && !document.cookie.includes("portfolio-owner-exclude=1"); }
export function track(name: Event["name"], component: Event["component"], properties: Properties = {}, path = window.location.pathname) {
  if (!enabled) return;
  const data = eventSchema.safeParse({ id: crypto.randomUUID(), name, component, properties, path: canonicalPath(path), time: new Date().toISOString() });
  if (!data.success) return;
  void fetch("/api/telemetry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify([data.data]), keepalive: true }).catch(() => {});
}
export function attribution(): Attribution {
  let source: Attribution["source"] = "direct";
  try { const host = new URL(document.referrer).hostname; if (host !== location.hostname) source = host.endsWith("linkedin.com") ? "linkedin" : host === "github.com" ? "github" : /(^|\.)google\.[a-z.]+$/.test(host) ? "google" : host === "www.bing.com" ? "bing" : "other"; } catch { /* Direct / withheld referral. */ }
  const campaign = new URLSearchParams(location.search).get("utm_campaign");
  const browser = /Edg\//.test(navigator.userAgent) ? "edge" : /Firefox/.test(navigator.userAgent) ? "firefox" : /Chrome/.test(navigator.userAgent) ? "chrome" : /Safari/.test(navigator.userAgent) ? "safari" : "other";
  return { source, campaign: campaign ? ["linkedin-profile", "portfolio-share", "research-release"].includes(campaign) ? campaign as Attribution["campaign"] : "other" : "none", device: innerWidth < 768 ? "mobile" : innerWidth < 1024 ? "tablet" : "desktop", browser, returning: optionalStorageGet("portfolio-returning") === "1" };
}
export function clearTrackingStorage() { setTracking(false); try { for (const storage of [localStorage, sessionStorage]) for (const key of Object.keys(storage)) if (key.startsWith("ph_") || key.startsWith("portfolio-")) storage.removeItem(key); } catch { /* Storage unavailable. Tracking remains off. */ } }

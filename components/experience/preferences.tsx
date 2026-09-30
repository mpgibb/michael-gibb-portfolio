"use client";
import { useEffect, useRef, useState } from "react";
import { attribution, clearTrackingStorage, setTracking, optionalStorageGet, optionalStorageSet } from "@/lib/experience/analytics-client";
import type { Consent } from "@/lib/experience/consent";
import { startReplay, stopReplay } from "@/lib/experience/replay";
export function Preferences({ onTracking }: { onTracking: (value: boolean) => void }) {
  const dialog = useRef<HTMLDialogElement>(null); const [banner, setBanner] = useState(false); const [analytics, setAnalytics] = useState(false); const [replay, setReplay] = useState(false); const [notice, setNotice] = useState(""); const [saving, setSaving] = useState(false);
  const active = useRef(false); const currentPreference = useRef<Consent | null>(null); const config = useRef<{ enabled: boolean; replay: boolean; token?: string; host?: string }>({ enabled: false, replay: false });
  useEffect(() => {
    let mounted = true;
    const apply = (preference: Consent | null) => {
      if (!mounted) return; currentPreference.current = preference;
      const allowed = !!preference?.analytics && config.current.enabled && optionalStorageGet("privacy-withdrawn") !== "1"; active.current = allowed; setAnalytics(!!preference?.analytics); setReplay(!!preference?.replay); setTracking(allowed); onTracking(allowed);
      if (allowed && preference?.replay) void startReplay(preference, config.current);
    };
    const open = () => dialog.current?.showModal(); window.addEventListener("portfolio:preferences", open);
    void fetch("/api/preferences", { cache: "no-store" }).then(r => r.json()).then(data => { if (!mounted) return; config.current = data.config; apply(data.preference); if (data.preference?.analytics && (data.preference.sessionExpires ?? 0) < Date.now() && optionalStorageGet("privacy-withdrawn") !== "1") void refresh(); setBanner(!data.preference && data.config.enabled); }).catch(() => {});
    const refresh = async () => { if (!active.current) return; try { const r = await fetch("/api/preferences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ analytics: true, replay: currentPreference.current?.replay ?? false, attribution: attribution() }) }); const data = await r.json(); if (r.ok) apply(data.preference); else { setTracking(false); onTracking(false); } } catch { setTracking(false); onTracking(false); } };
    // Session renewal happens only while visible, every 25 minutes. No monitoring job.
    const interval = window.setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 1500000);
    return () => { mounted = false; clearInterval(interval); window.removeEventListener("portfolio:preferences", open); setTracking(false); void stopReplay(); };
  }, [onTracking]);
  async function save(allow: boolean, allowReplay: boolean) {
    if (saving) return; const source = allow ? attribution() : undefined; setSaving(true); setNotice("");
    optionalStorageSet("privacy-withdrawn", "1"); setTracking(false); onTracking(false); await stopReplay(); clearTrackingStorage();
    try {
      const response = await fetch("/api/preferences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ analytics: allow, replay: allowReplay, ...(allow ? { attribution: source } : {}) }) });
      const data = await response.json(); if (!response.ok) throw new Error();
      allow = data.preference.analytics; allowReplay = data.preference.replay; currentPreference.current = data.preference; if (allow) optionalStorageSet("privacy-withdrawn", null); setAnalytics(allow); setReplay(allowReplay); const allowed = allow && config.current.enabled; active.current = allowed; setTracking(allowed); onTracking(allowed); if (allow) optionalStorageSet("portfolio-returning", "1");
      if (allowed && allowReplay) void startReplay(data.preference, config.current);
      setBanner(false); dialog.current?.close();
    } catch { setNotice("Preferences could not be saved. Optional tracking is off; please retry."); } finally { setSaving(false); }
  }
  return <>{banner && <aside className="consent-banner" aria-label="Optional privacy choices"><p>Optional analytics help improve this portfolio. Browsing, chat and contact work without them.</p><div><button onClick={() => void save(true, false)} disabled={saving}>Accept analytics</button><button onClick={() => void save(false, false)} disabled={saving}>Reject optional</button><button onClick={() => dialog.current?.showModal()}>Choose preferences</button></div><p role="status">{notice}</p></aside>}<dialog ref={dialog} className="experience-dialog preferences-dialog" aria-labelledby="preferences-title"><h2 id="preferences-title">Privacy preferences</h2><p>Security verification and inquiry delivery are essential. These optional choices do not affect them.</p><label><input type="checkbox" checked={analytics} onChange={e => { setAnalytics(e.target.checked); if (!e.target.checked) setReplay(false); }} /> Analytics — pseudonymous navigation and interaction events.</label><label><input type="checkbox" checked={replay} disabled={!analytics} onChange={e => setReplay(e.target.checked)} /> Masked session replay — sampled interaction structure and heatmaps. Requires analytics; all text and inputs are masked.</label><p>Optional services may remain unavailable until configured. No raw chat, search or contact text belongs in analytics. <a href="/privacy">Read the privacy notice</a>.</p><div className="experience-actions"><button onClick={() => void save(analytics, replay)} disabled={saving}>Save choices</button><button onClick={() => void save(false, false)} disabled={saving}>Reject optional</button><button onClick={() => dialog.current?.close()}>Close</button></div><p role="status">{notice}</p></dialog></>;
}

"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track as capture } from "@/lib/experience/analytics-client";
import { canonicalPath, publicProjects, type Event, type Properties } from "@/lib/experience/schema";
export function ExperienceObserver() {
  const path = usePathname();
  useEffect(() => {
    const project = publicProjects.find(p => p.path === path && path !== "/research"); const properties = { project_id: project?.id }; let lastActive = Date.now(); let active = 0; let demoStarted = false; const milestones = new Set<number>(); const sections = new Set<string>(); let debounce: ReturnType<typeof setTimeout>;
    const track = (name: Event["name"], component: Event["component"], props: Properties = {}) => capture(name, component, props, path);
    let viewed = false; const viewTimer = setTimeout(() => { viewed = true; track("page_view", "page", properties); if (project) track("project_view", "study", properties); }, 0);
    const engage = () => { lastActive = Date.now(); };
    const tick = setInterval(() => { if (document.visibilityState === "visible" && Date.now() - lastActive < 30000) active += 5; if (active >= 30) { track("active_reading", "page", { ...properties, seconds: active }); active = 0; } }, 5000);
    const exit = () => { if (!viewed) return; if (active > 0) { track("active_reading", "page", { ...properties, seconds: active }); active = 0; } track("page_exit", "page", properties); };
    const scroll = () => { engage(); const height = document.documentElement.scrollHeight - innerHeight; if (height <= 0) return; const percent = scrollY / height * 100; for (const threshold of [25,50,75,100] as const) if (percent + 1 >= threshold && !milestones.has(threshold)) { milestones.add(threshold); track("scroll_depth", "page", { ...properties, percent: threshold }); } };
    const click = (event: MouseEvent) => {
      engage(); const target = event.target instanceof Element ? event.target : null; if (!target || target.closest(".assistant-panel, .contact-form, .preferences-dialog, .consent-banner")) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (anchor) {
        const url = new URL(anchor.href); const component: Event["component"] = anchor.closest("header") ? "header" : anchor.closest("footer") ? "footer" : "study";
        const destination = url.origin === location.origin ? canonicalPath(url.pathname) : url.hostname === "github.com" ? "github" : url.hostname.endsWith("linkedin.com") ? "linkedin" : "external";
        const result = anchor.closest<HTMLElement>("[data-study-id]");
        if (result) { const siblings = [...(result.parentElement?.querySelectorAll("[data-study-id]") ?? [])]; track("research_result", "research", { project_id: result.dataset.studyId, position: Math.min(100, siblings.indexOf(result)+1) }); }
        track(anchor.hasAttribute("download") || /\.(zip|pdf|csv|json)$/.test(url.pathname) ? "download_click" : url.origin !== location.origin ? "source_click" : "navigation", component, { ...properties, target: destination === "/unknown" ? "external" : destination });
      }
      if (project && target.closest(".program-explorer .catalog-reset, .incrementality-explorer .catalog-reset")) track("demo_reset", "demo", properties);
      const expanded = target.closest("button[aria-expanded]"); if (expanded) track("menu", "header", { category: expanded.getAttribute("aria-expanded") === "true" ? "close" : "open" });
    };
    const change = (event: globalThis.Event) => {
      const element = event.target instanceof Element ? event.target : null;
      if (!project || !element?.matches('input[type="range"], .model-control select, .evidence-explorer select, .explorer-panel select, .program-explorer select')) return;
      if (!demoStarted) { demoStarted = true; track("demo_start", "demo", properties); }
      clearTimeout(debounce); debounce = setTimeout(() => { track("demo_change", "demo", { ...properties, category: "parameter" }); track("demo_run", "demo", properties); }, 600);
    };
    const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting && document.visibilityState === "visible" && entry.target.id && !sections.has(entry.target.id)) { sections.add(entry.target.id); const id = entry.target.id; const section: Properties["section"] = id.includes("executive") ? "executive" : id.includes("method") ? "method" : ["hero","work","approach","about","contact","decision","evidence","data","limitations","code"].includes(id) ? id as Properties["section"] : "other"; track("section_view", "page", { ...properties, section }); if (section === "contact") track("contact_view", "contact", { category: "ordinary" }); } }, { threshold: .25 });
    document.querySelectorAll("main section[id]").forEach(section => observer.observe(section));
    const error = () => { track("application_error", "page", { category: "unavailable" }); if (demoStarted) track("demo_error", "demo", { ...properties, category: "unavailable" }); };
    let performanceObserver: PerformanceObserver | undefined;
    try { performanceObserver = new PerformanceObserver(list => { const last = list.getEntries().at(-1); if (last) track("page_performance", "page", { latency_ms: Math.min(120000, last.startTime), category: "performance" }); }); performanceObserver.observe({ type: "largest-contentful-paint", buffered: true }); } catch { /* Unsupported browser metric. */ }
    window.addEventListener("scroll", scroll, { passive:true }); window.addEventListener("pointerdown", engage); window.addEventListener("keydown", engage); window.addEventListener("click", click); window.addEventListener("change", change); window.addEventListener("pagehide", exit); window.addEventListener("error", error);
    return () => { clearTimeout(viewTimer); exit(); clearInterval(tick); clearTimeout(debounce); observer.disconnect(); performanceObserver?.disconnect(); window.removeEventListener("scroll", scroll); window.removeEventListener("pointerdown", engage); window.removeEventListener("keydown", engage); window.removeEventListener("click", click); window.removeEventListener("change", change); window.removeEventListener("pagehide", exit); window.removeEventListener("error", error); };
  }, [path]);
  return null;
}

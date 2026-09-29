"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProgramStudy } from "@/lib/program-registry";
import { businessAreas, inBusinessArea, matchesResearch } from "@/lib/research-discovery";

export type Demonstration = { slug: string; title: string; short: string; category: string; methods: string[]; decisionType: string };
export type CatalogFilters = { q: string; industry: string; area: string; method: string; decision: string; status: string };
const defaults: CatalogFilters = { q: "", industry: "all", area: "all", method: "all", decision: "all", status: "completed" };
const labels: Record<ProgramStudy["executionStatus"], string> = { planned: "Planned", data_ready: "Data inspected", baseline_complete: "Baseline evaluated", evaluated: "Evaluated", blocked: "Awaiting prerequisite" };

export function ResearchCatalog({ studies, demonstrations, initialFilters }: { studies: ProgramStudy[]; demonstrations: Demonstration[]; initialFilters: CatalogFilters }) {
  const industries = [...new Set(studies.map(study => study.industry))].sort();
  const methods = [...new Set(studies.flatMap(study => study.methods))].sort();
  const decisions = [...new Set(studies.map(study => study.decisionType))].sort();
  function validated(input: CatalogFilters): CatalogFilters {
    return { q: input.q, industry: industries.includes(input.industry) ? input.industry : "all", area: businessAreas.some(area => area.id === input.area) ? input.area : "all", method: methods.includes(input.method) ? input.method : "all", decision: decisions.includes(input.decision) ? input.decision : "all", status: ["completed", "agenda", "all", ...Object.keys(labels)].includes(input.status) ? input.status : "completed" };
  }
  const [filters, setFilters] = useState(() => validated(initialFilters));
  const { q, industry, area, method, decision, status } = filters;
  // Filter changes stay shareable without navigating or moving keyboard focus.
  function change(next: Partial<CatalogFilters>) {
    const value = { ...filters, ...next };
    setFilters(value);
    const url = new URL(window.location.href);
    for (const key of Object.keys(defaults) as (keyof CatalogFilters)[]) {
      if (value[key] === defaults[key]) url.searchParams.delete(key);
      else url.searchParams.set(key, value[key]);
    }
    window.history.replaceState(null, "", url);
  }
  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(window.location.search);
      setFilters(Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, params.get(key) ?? value])) as CatalogFilters);
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  const completed = studies.filter(study => study.publicationStatus === "published").length;
  const matching = studies.filter(study => {
    const description = `${study.id} ${study.title} ${study.industry} ${study.question} ${study.methodSummary} ${study.dataset.name}`;
    return (industry === "all" || study.industry === industry) && inBusinessArea(area, study.id, description) &&
      (method === "all" || study.methods.includes(method)) && (decision === "all" || study.decisionType === decision) &&
      (status === "all" || (status === "completed" ? study.publicationStatus === "published" : status === "agenda" ? study.publicationStatus !== "published" : study.executionStatus === status)) && matchesResearch(q, study.id, description);
  }).sort((a, b) => Number(b.publicationStatus === "published") - Number(a.publicationStatus === "published") || a.id.localeCompare(b.id));
  const examples = demonstrations.filter(item => (status === "all" || status === "completed") && industry === "all" && inBusinessArea(area, item.slug, `${item.title} ${item.short}`) && (method === "all" || item.methods.includes(method)) && (decision === "all" || item.decisionType === decision) && matchesResearch(q, item.slug, `${item.title} ${item.short} ${item.category}`));
  const reset = () => change(defaults);
  return <div data-testid="research-catalog">
    <div className="catalog-views" aria-label="Research collection"><button type="button" aria-pressed={status === "completed"} onClick={() => change({ status: "completed" })}>Published work</button><button type="button" aria-pressed={status === "agenda"} onClick={() => change({ status: "agenda" })}>Research agenda</button></div>
    <div className="catalog-overview">{status === "agenda" ? <><p><strong>{studies.length - completed}</strong> topics awaiting publication</p><p><strong>{completed} of {studies.length}</strong> program studies published</p><p><strong>{industries.length}</strong> industries in the agenda</p></> : <><p><strong>{completed}</strong> evaluated public-data studies</p><p><strong>{demonstrations.length}</strong> evaluated synthetic demonstrations</p></>}</div>
    {status === "agenda" && <p className="catalog-note">This is a research plan. Topics below do not yet have published findings or public case-study pages.</p>}
    <div className="catalog-filters" role="search" aria-label="Filter research">
      <label className="catalog-search">Search research<input type="search" value={q} onChange={event => change({ q: event.target.value })} placeholder="Business question, method or study ID" /></label>
      <label>Business area<select value={area} onChange={event => change({ area: event.target.value })}><option value="all">All business areas</option>{businessAreas.map(value => <option key={value.id} value={value.id}>{value.label}</option>)}</select></label>
      <label>Industry<select value={industry} onChange={event => change({ industry: event.target.value })}><option value="all">All industries</option>{industries.map(value => <option key={value}>{value}</option>)}</select></label>
      <details className="catalog-advanced" open={method !== "all" || decision !== "all" || !["completed", "agenda"].includes(status) ? true : undefined}><summary>Advanced filters</summary><div>
        <label>Method<select value={method} onChange={event => change({ method: event.target.value })}><option value="all">All methods</option>{methods.map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Decision<select value={decision} onChange={event => change({ decision: event.target.value })}><option value="all">All decisions</option>{decisions.map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Status<select value={status} onChange={event => change({ status: event.target.value })}><option value="completed">Published work</option><option value="agenda">Research agenda</option><option value="all">All research</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </div></details>
      <button type="button" className="catalog-reset" onClick={reset}>Reset filters</button>
    </div>
    <div className="catalog-results-heading"><p aria-live="polite" role="status">{matching.length + examples.length} matching {matching.length + examples.length === 1 ? "study" : "studies"}{industry !== "all" ? ` · ${industry}` : ""}</p></div>
    <div className="collection-grid">
      {matching.map(study => <article key={study.id} data-study-id={study.id}><p className="eyebrow">{study.id} / {study.industry}</p><h3>{study.publicationStatus === "published" ? <Link href={`/research/${study.slug}`}>{study.title}</Link> : study.title}</h3><p>{study.question}</p><p className="project-status">{study.publicationStatus === "published" ? "Evaluated public-data study" : labels[study.executionStatus]}</p>{study.publicationStatus === "published" ? <Link className="text-link" href={`/research/${study.slug}`}>Read the finding and evidence ↗</Link> : null}<details><summary>{study.publicationStatus === "published" ? "Methods & source" : "Proposed design & source"}</summary><p>{study.methodSummary}</p>{study.publicationStatus !== "published" && <><p>{study.design}</p><p><strong>Evaluation:</strong> {study.evaluation}</p><p><strong>Boundary:</strong> {study.limitations}</p></>}<p><a href={study.dataset.url}>{study.dataset.name} ↗</a></p>{study.codeUrl && <p><a href={study.codeUrl}>Research code ↗</a></p>}</details></article>)}
      {examples.map(item => <article key={item.slug} data-study-id={item.slug}><p className="eyebrow">DEMONSTRATION / {item.category}</p><h3><Link href={`/projects/${item.slug}`}>{item.title}</Link></h3><p>{item.short}</p><p className="project-status">Evaluated synthetic demonstration</p><Link className="text-link" href={`/projects/${item.slug}#executive-summary`}>Read the finding and evidence ↗</Link><details><summary>Methods & evidence</summary><p>{item.methods.join(" · ")}</p><p><Link href={`/projects/${item.slug}#data`}>Synthetic design and reproducible source ↗</Link></p></details></article>)}
    </div>
    {matching.length + examples.length === 0 && <div className="catalog-empty"><h3>No studies match these filters.</h3><p>Try a broader search or browse the research agenda for planned work.</p><button type="button" className="catalog-reset" onClick={reset}>Reset filters</button></div>}
    <p className="catalog-note">Published findings link to evaluated artifacts and research code. The {studies.length}-study agenda spans {industries.length} industries; synthetic demonstrations are counted separately. Planned topics have no public case-study route.</p>
  </div>;
}

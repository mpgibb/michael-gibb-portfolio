"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProgramStudy } from "@/lib/program-registry";
import { businessAreas, inBusinessArea, matchesResearch, industryNames, studyDescription, topicStatus } from "@/lib/research-discovery";

export type Demonstration = { slug: string; title: string; short: string; category: string; methods: string[]; decisionType: string };
export type CatalogFilters = { q: string; industry: string; area: string; method: string; decision: string; status: string };
export const catalogDefaults: CatalogFilters = { q: "", industry: "all", area: "all", method: "all", decision: "all", status: "completed" };
const labels = { planned: "Planned topics", data_ready: "In progress · data inspected", baseline_complete: "In progress · baseline evaluated", evaluated: "Evaluated", blocked: "Awaiting prerequisite" };
function validFilters(input: CatalogFilters, studies: ProgramStudy[]): CatalogFilters {
  return { q: input.q.slice(0, 200), industry: industryNames(studies).includes(input.industry) ? input.industry : "all", area: businessAreas.some(area => area.id === input.area) ? input.area : "all", method: studies.some(study => study.methods.includes(input.method)) ? input.method : "all", decision: studies.some(study => study.decisionType === input.decision) ? input.decision : "all", status: ["completed", "agenda", "all", ...Object.keys(labels)].includes(input.status) ? input.status : "completed" };
}

export function ResearchCatalog({ studies, demonstrations, initialFilters }: { studies: ProgramStudy[]; demonstrations: Demonstration[]; initialFilters: CatalogFilters }) {
  const industries = industryNames(studies);
  const methods = [...new Set(studies.flatMap(study => study.methods))].sort();
  const decisions = [...new Set(studies.map(study => study.decisionType))].sort();
  const [filters, setFilters] = useState(() => validFilters(initialFilters, studies));
  const { q, industry, area, method, decision, status } = filters;
  function change(next: Partial<CatalogFilters>, replace = false) {
    const value = validFilters({ ...filters, ...next }, studies);
    setFilters(value);
    const url = new URL(window.location.href);
    for (const key of Object.keys(catalogDefaults) as (keyof CatalogFilters)[]) {
      if (value[key] === catalogDefaults[key]) url.searchParams.delete(key);
      else url.searchParams.set(key, value[key]);
    }
    url.hash = "";
    if (url.href !== window.location.href) window.history[replace ? "replaceState" : "pushState"](null, "", url);
  }
  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(window.location.search);
      setFilters(validFilters(Object.fromEntries(Object.entries(catalogDefaults).map(([key, value]) => [key, params.get(key) ?? (key === "status" && params.has("industry") ? "all" : value)])) as CatalogFilters, studies));
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [studies]);
  const completed = studies.filter(study => study.publicationStatus === "published").length;
  const matchingBase = studies.filter(study => {
    const description = `${studyDescription(study)} ${study.dataset.name}`;
    return (industry === "all" || study.industry === industry) && inBusinessArea(area, study.id, description) && (method === "all" || study.methods.includes(method)) && (decision === "all" || study.decisionType === decision) && matchesResearch(q, study.id, description);
  });
  const matching = matchingBase.filter(study => status === "all" || (status === "completed" ? study.publicationStatus === "published" : status === "agenda" ? study.publicationStatus !== "published" : study.executionStatus === status));
  const published = matching.filter(study => study.publicationStatus === "published");
  const planned = matching.filter(study => study.publicationStatus !== "published");
  const examples = demonstrations.filter(item => (status === "all" || status === "completed") && industry === "all" && inBusinessArea(area, item.slug, `${item.title} ${item.short}`) && (method === "all" || item.methods.includes(method)) && (decision === "all" || item.decisionType === decision) && matchesResearch(q, item.slug, `${item.title} ${item.short} ${item.category} ${item.methods.join(" ")}`));
  const hiddenTopics = matchingBase.filter(study => study.publicationStatus !== "published").length;
  const reset = () => change(catalogDefaults);
  const renderStudy = (study: ProgramStudy) => <article key={study.id} id={`topic-${study.id}`} data-study-id={study.id}><p className="eyebrow">{study.id} / {study.industry}</p><h4>{study.publicationStatus === "published" ? <Link href={`/research/${study.slug}`}>{study.title}</Link> : study.title}</h4><p>{study.question}</p><p className="project-status">{study.publicationStatus === "published" ? "Evaluated public-data study" : topicStatus(study)}</p>{study.publicationStatus === "published" ? <Link className="text-link" href={`/research/${study.slug}`}>Read the finding and evidence ↗</Link> : null}<details><summary>{study.publicationStatus === "published" ? "Methods & source" : "Proposed design & source"}</summary><p>{study.methodSummary}</p>{study.publicationStatus !== "published" && <><p>{study.design}</p><p><strong>Evaluation:</strong> {study.evaluation}</p><p><strong>Boundary:</strong> {study.limitations}</p></>}<p><a href={study.dataset.url}>{study.dataset.name} ↗</a></p>{study.codeUrl && <p><a href={study.codeUrl}>Research code ↗</a></p>}</details></article>;
  return <div data-testid="research-catalog">
    <p className="catalog-overview"><strong>{completed} published public-data studies</strong><span>{demonstrations.length} synthetic demonstrations</span><span>{studies.length - completed} planned or developing topics</span></p>
    <div className="catalog-filters" role="search" aria-label="Filter research">
      <label className="catalog-search">Search research<input type="search" maxLength={200} value={q} onChange={event => change({ q: event.target.value }, true)} placeholder="Business question, method or study ID" /></label>
      <label>Business area<select value={area} onChange={event => change({ area: event.target.value })}><option value="all">All business areas</option>{businessAreas.map(value => <option key={value.id} value={value.id}>{value.label}</option>)}</select></label>
      <label>Industry<select value={industry} onChange={event => change({ industry: event.target.value, status: event.target.value === "all" ? "completed" : "all" })}><option value="all">All industries</option>{industries.map(value => <option key={value}>{value}</option>)}</select></label>
      <details className="catalog-advanced" open={method !== "all" || decision !== "all" || !["completed", "agenda", "all"].includes(status) ? true : undefined}><summary>More filters</summary><div>
        <label>Method<select value={method} onChange={event => change({ method: event.target.value })}><option value="all">All methods</option>{methods.map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Decision<select value={decision} onChange={event => change({ decision: event.target.value })}><option value="all">All decisions</option>{decisions.map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Status<select value={status} onChange={event => change({ status: event.target.value })}><option value="completed">Published work</option><option value="agenda">Planned &amp; developing topics</option><option value="all">All work and topics</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </div></details>
      <button type="button" className="catalog-reset" onClick={reset}>Reset filters</button>
    </div>
    <div className="catalog-results-heading"><h2>{industry === "all" ? "Explore the collection" : industry}</h2><p aria-live="polite" role="status">{published.length} published {published.length === 1 ? "study" : "studies"}{examples.length > 0 ? ` · ${examples.length} demonstrations` : ""} · {planned.length} planned or developing topics</p></div>
    {published.length + examples.length > 0 && <section aria-labelledby="published-heading"><h3 id="published-heading" className="collection-subheading">Published findings &amp; demonstrations</h3><div className="collection-grid">{published.map(renderStudy)}
      {examples.map(item => <article key={item.slug} data-study-id={item.slug}><p className="eyebrow">DEMONSTRATION / {item.category}</p><h4><Link href={`/projects/${item.slug}`}>{item.title}</Link></h4><p>{item.short}</p><p className="project-status">Evaluated synthetic demonstration</p><Link className="text-link" href={`/projects/${item.slug}#executive-summary`}>Read the finding and evidence ↗</Link><details><summary>Methods &amp; evidence</summary><p>{item.methods.join(" · ")}</p><p><Link href={`/projects/${item.slug}#data`}>Synthetic design and reproducible source ↗</Link></p></details></article>)}
    </div></section>}
    {planned.length > 0 && <section className="planned-collection" aria-labelledby="planned-heading"><h3 id="planned-heading" className="collection-subheading">Planned topics &amp; work in progress</h3><p className="collection-intro">{published.length === 0 && examples.length === 0 ? "No findings are published for this selection yet. " : ""}These topics are separate from completed findings. Each status reflects the work actually performed.</p><div className="collection-grid">{planned.map(renderStudy)}</div></section>}
    {matching.length + examples.length === 0 && <div className="catalog-empty"><h3>No results match these filters.</h3>{hiddenTopics > 0 && status === "completed" ? <><p>{hiddenTopics} planned or developing topics are available for these filters.</p><button className="catalog-reset" type="button" onClick={() => change({ status: "all" })}>Show available topics</button></> : <p>Try a broader search or reset the filters to explore the collection.</p>}<button type="button" className="catalog-reset" onClick={reset}>Reset filters</button></div>}
    <p className="catalog-note">The {studies.length}-topic program spans {industries.length} industries, with {completed} studies published. Synthetic demonstrations are counted separately. Unpublished topics have no public case-study route.</p>
  </div>;
}

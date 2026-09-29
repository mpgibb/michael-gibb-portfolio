"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProgramStudy } from "@/lib/program-registry";

export type Demonstration = { slug: string; title: string; short: string; category: string; methods: string[]; decisionType: string };
type CatalogProps = { studies: ProgramStudy[]; demonstrations: Demonstration[] };
const labels: Record<ProgramStudy["executionStatus"], string> = { planned: "Planned", data_ready: "Data inspected", baseline_complete: "Baseline evaluated", evaluated: "Evaluated", blocked: "Awaiting prerequisite" };

export function ResearchCatalog({ studies, demonstrations, initialIndustry, initialStatus }: CatalogProps & { initialIndustry: string; initialStatus: string }) {
  const industries = [...new Set(studies.map(study => study.industry))].sort();
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState(industries.includes(initialIndustry) ? initialIndustry : "all");
  const [method, setMethod] = useState("all");
  const [decision, setDecision] = useState("all");
  const [status, setStatus] = useState(["completed", "agenda", "all", ...Object.keys(labels)].includes(initialStatus) ? initialStatus : "completed");
  const methods = [...new Set(studies.flatMap(study => study.methods))].sort();
  const decisions = [...new Set(studies.map(study => study.decisionType))].sort();
  const search = query.trim().toLocaleLowerCase();
  const completed = studies.filter(study => study.publicationStatus === "published").length;
  const matching = studies.filter(study =>
    (industry === "all" || study.industry === industry) &&
    (method === "all" || study.methods.includes(method)) &&
    (decision === "all" || study.decisionType === decision) &&
    (status === "all" || (status === "completed" ? study.publicationStatus === "published" : status === "agenda" ? study.publicationStatus !== "published" : study.executionStatus === status)) &&
    (!search || `${study.id} ${study.title} ${study.industry} ${study.question} ${study.methodSummary} ${study.dataset.name}`.toLocaleLowerCase().includes(search))
  ).sort((a, b) => Number(b.publicationStatus === "published") - Number(a.publicationStatus === "published") || a.id.localeCompare(b.id));
  const examples = demonstrations.filter(item => (status === "all" || status === "completed") && industry === "all" && (method === "all" || item.methods.includes(method)) && (decision === "all" || item.decisionType === decision) && (!search || `${item.title} ${item.short} ${item.category}`.toLocaleLowerCase().includes(search)));
  function reset() { setQuery(""); setIndustry("all"); setMethod("all"); setDecision("all"); setStatus("completed"); }
  return <div data-testid="research-catalog">
    <div className="catalog-overview"><p><strong>{completed} of 60</strong> program studies published</p><p><strong>{demonstrations.length}</strong> evaluated synthetic demonstrations</p><p><strong>20</strong> industries in the research agenda</p></div>
    <div className="catalog-filters" role="search" aria-label="Filter research">
      <label className="catalog-search">Search research<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Question, method, dataset or study ID" /></label>
      <label>Industry<select value={industry} onChange={event => setIndustry(event.target.value)}><option value="all">All industries</option>{industries.map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Method<select value={method} onChange={event => setMethod(event.target.value)}><option value="all">All methods</option>{methods.map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Decision<select value={decision} onChange={event => setDecision(event.target.value)}><option value="all">All decisions</option>{decisions.map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Status<select value={status} onChange={event => setStatus(event.target.value)}><option value="completed">Published studies & demonstrations</option><option value="agenda">Research agenda</option><option value="all">All research</option><option value="planned">Planned</option><option value="data_ready">Data inspected</option><option value="baseline_complete">Baseline evaluated</option><option value="evaluated">Evaluated program studies</option><option value="blocked">Awaiting prerequisite</option></select></label>
      <button type="button" className="catalog-reset" onClick={reset}>Reset filters</button>
    </div>
    <div className="catalog-results-heading"><p aria-live="polite" role="status">{matching.length + examples.length} matching {matching.length + examples.length === 1 ? "study" : "studies"}</p><button type="button" className="catalog-agenda-link" onClick={() => { setStatus(status === "agenda" ? "completed" : "agenda"); }}>{status === "agenda" ? "Show published work" : "Browse the research agenda"}</button></div>
    <div className="collection-grid">
      {matching.map(study => <article key={study.id} data-study-id={study.id}><p className="eyebrow">{study.id} / {study.industry}</p><h3>{study.publicationStatus === "published" ? <Link href={`/research/${study.slug}`}>{study.title}</Link> : study.title}</h3><p>{study.question}</p><p className="project-status">{study.publicationStatus === "published" ? "Evaluated public-data study" : labels[study.executionStatus]}</p><p className="catalog-method">{study.methodSummary}</p>{study.publicationStatus === "published" ? <><Link className="text-link" href={`/research/${study.slug}`}>Read the finding and evidence ↗</Link><a className="source-link" href={study.codeUrl!}>Research code ↗</a></> : <details><summary>Research question and proposed design</summary><p>{study.design}</p><p><strong>Evaluation:</strong> {study.evaluation}</p><p><strong>Boundary:</strong> {study.limitations}</p><p className="caption">No completed finding is claimed for this topic.</p></details>}<p className="catalog-source"><a href={study.dataset.url}>{study.dataset.name} ↗</a></p><p className="caption">Original dataset selection position {study.dataset.selectionRank} within this industry. This is research-selection metadata, not measured model performance.</p></article>)}
      {examples.map(item => <article key={item.slug}><p className="eyebrow">DEMONSTRATION / {item.category}</p><h3><Link href={`/projects/${item.slug}`}>{item.title}</Link></h3><p>{item.short}</p><p className="project-status">Evaluated synthetic demonstration</p><Link className="text-link" href={`/projects/${item.slug}#executive-summary`}>Read the executive summary ↗</Link><Link className="source-link" href={`/projects/${item.slug}#evidence`}>Explore the evidence ↗</Link></article>)}
    </div>
    {matching.length + examples.length === 0 && <div className="catalog-empty"><h3>No studies match these filters.</h3><p>Try a broader search or browse the research agenda for planned work.</p><button type="button" className="catalog-reset" onClick={reset}>Reset filters</button></div>}
    <p className="catalog-note">Program progress counts the 60 numbered studies separately from the four original synthetic demonstrations. Planned topics have no public case-study route. Published findings link to evaluated artifacts and research code.</p>
  </div>;
}

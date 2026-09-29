"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { industryNames, industryDestination, matchesResearch, studyDescription, topicStatus, type NavigationStudy } from "@/lib/research-discovery";

export function ResearchMenu({ studies, open, setOpen }: { studies: NavigationStudy[]; open: boolean; setOpen: (open: boolean) => void }) {
  const [query, setQuery] = useState("");
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const industries = industryNames(studies);
  const matches = studies.filter(study => matchesResearch(query, study.id, studyDescription(study)));
  const foundIndustries = industries.filter(industry => matchesResearch(query, "", industry) || matches.some(study => study.industry === industry));
  const published = matches.filter(study => study.publicationStatus === "published");
  const planned = matches.filter(study => study.publicationStatus !== "published");
  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const dismiss = (event: PointerEvent) => { if (!container.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open, setOpen]);

  return <div className="research-menu" ref={container}
    onKeyDown={event => { if (event.key === "Escape" && open) { event.stopPropagation(); setOpen(false); trigger.current?.focus(); } }}>
    <button ref={trigger} type="button" aria-expanded={open} aria-controls="research-industries" onClick={() => setOpen(!open)}>Industries <span aria-hidden="true">⌄</span></button>
    <div id="research-industries" className="industry-panel" hidden={!open}>
      <div className="industry-search"><label htmlFor="industry-search">Search industries, topics, or methods</label><input ref={search} id="industry-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try healthcare or forecasting" autoComplete="off" /></div>
      <div className="industry-results">
        <h2>Industries</h2>
        <ul className="industry-list">{foundIndustries.map(industry => {
          const records = studies.filter(study => study.industry === industry);
          const count = records.filter(study => study.publicationStatus === "published").length;
          return <li key={industry}><Link href={industryDestination(industry)} onClick={() => setOpen(false)}><strong>{industry}</strong><span>{count ? `${count} published · ${records.length - count} planned or developing` : `${records.length} planned or developing topics`}</span></Link></li>;
        })}</ul>
        {query.trim() && <>
          {published.length > 0 && <><h2>Published studies</h2><ul className="industry-studies">{published.map(study => <li key={study.id}><Link href={`/research/${study.slug}`} onClick={() => setOpen(false)}><strong>{study.title}</strong><span>{study.id} · {study.industry}</span></Link></li>)}</ul></>}
          {planned.length > 0 && <><h2>Planned topics &amp; work in progress</h2><ul className="industry-studies">{planned.map(study => <li key={study.id}><Link href={`${industryDestination(study.industry)}#topic-${study.id}`} onClick={() => setOpen(false)}><strong>{study.title}</strong><span>{study.id} · {topicStatus(study)}</span></Link></li>)}</ul></>}
          {foundIndustries.length + matches.length === 0 && <p className="industry-empty" role="status">No matches. Try a broader topic or clear the search.</p>}
        </>}
      </div>
      <Link className="industry-all" href="/research" onClick={() => setOpen(false)}>Explore all work <span aria-hidden="true">→</span></Link>
    </div>
  </div>;
}

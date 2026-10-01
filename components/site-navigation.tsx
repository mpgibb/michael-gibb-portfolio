"use client";

import { SectionLink } from "./section-link";
import { useEffect, useRef, useState } from "react";
import { ResearchMenu } from "./research-menu";
import type { NavigationStudy } from "@/lib/research-discovery";

export function SiteNavigation({ studies }: { studies: NavigationStudy[] }) {
  const [open, setOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) { setOpen(false); setIndustriesOpen(false); }
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  return <div className="site-navigation" ref={container} data-open={open}
    onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setIndustriesOpen(false); } }}
    onKeyDown={event => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        setIndustriesOpen(false);
        trigger.current?.focus();
      }
    }}>
    <button ref={trigger} type="button" className="menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"}
      aria-expanded={open} aria-controls="main-navigation" onClick={() => { setOpen(value => !value); setIndustriesOpen(false); }}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={open ? "M5 5 L19 19 M5 19 L19 5" : "M3 6 H21 M3 12 H21 M3 18 H21"} /></svg>
    </button>
    <nav id="main-navigation" aria-label="Main navigation" onClick={event => {
      if ((event.target as Element).closest("a")) { setOpen(false); setIndustriesOpen(false); }
    }}>
      <ResearchMenu studies={studies} open={industriesOpen} setOpen={setIndustriesOpen} />
      <SectionLink href="/#approach">Approach</SectionLink>
      <SectionLink href="/#about">Leadership</SectionLink>
      <SectionLink className="nav-contact" href="/#contact">Contact</SectionLink>
    </nav>
    <a className="header-linkedin" href="https://www.linkedin.com/in/mp-gibb/" target="_blank" rel="noopener noreferrer"
      aria-label="Connect with Michael on LinkedIn (opens in a new tab)" title="Connect on LinkedIn"
      onClick={() => { setOpen(false); setIndustriesOpen(false); }}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M5.5 3a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3.5 10h4v11h-4ZM10 10h4v1.5c.7-1.1 1.8-1.8 3.4-1.8 3 0 4.1 1.9 4.1 5V21h-4v-5.6c0-1.5-.4-2.4-1.7-2.4-1.4 0-1.8 1-1.8 2.4V21h-4Z" /></svg>
      <span>Connect</span>
    </a>
    <noscript><style>{"@media(max-width:1099px){.site-header .site-navigation nav{display:flex;position:static}.menu-toggle{display:none}}"}</style></noscript>
  </div>;
}

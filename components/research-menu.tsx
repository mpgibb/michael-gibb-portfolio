"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function ResearchMenu() {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  return <div className="research-menu" ref={container}
    onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
    onKeyDown={event => { if (event.key === "Escape" && open) { event.stopPropagation(); setOpen(false); trigger.current?.focus(); } }}>
    <button ref={trigger} type="button" aria-expanded={open} aria-controls="research-industries" onClick={() => setOpen(previous => !previous)}>Research <span aria-hidden="true">⌄</span></button>
    <ul id="research-industries" className="research-dropdown" hidden={!open}>
      <li><Link href="/research" onClick={() => setOpen(false)}><strong>Published research</strong><span>Findings, evidence and source</span></Link></li>
      <li><Link href="/research?status=all&industry=Sports%20analytics%20and%20baseball" onClick={() => setOpen(false)}><strong>Sports analytics</strong><span>Baseball research agenda</span></Link></li>
      <li><Link href="/research?status=agenda" onClick={() => setOpen(false)}><strong>Research agenda</strong><span>60 studies across 20 industries</span></Link></li>
      <li className="research-all"><Link href="/research" onClick={() => setOpen(false)}>Browse research →</Link></li>
    </ul>
  </div>;
}

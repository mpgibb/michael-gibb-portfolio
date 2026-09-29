"use client";

import { useEffect, useRef, useState } from "react";

const programSections = [["decision", "Decision & executive summary"], ["implication", "Implication"], ["evidence", "Evidence"], ["data", "Data"], ["method", "Method & limitations"], ["code", "Code"]];
const demoSections = [["executive-summary", "Executive summary"], ["decision", "Business decision"], ["implication", "Practical implication"], ["evidence", "Evidence"], ["data", "Data"], ["methodology", "Methodology"], ["limitations", "Limitations"], ["code", "Code & next steps"]];

export function CaseContents({ demonstration = false }: { demonstration?: boolean }) {
  const sections = demonstration ? demoSections : programSections;
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const elements = sections.map(([id]) => document.getElementById(id)).filter((element): element is HTMLElement => Boolean(element));
      const current = elements.filter(element => element.getBoundingClientRect().top <= 145).at(-1);
      setActive(current?.id ?? "");
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    const body = document.querySelector(".case-body");
    if (body) observer.observe(body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    schedule();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); window.removeEventListener("hashchange", schedule); };
  }, [sections]);
  return <aside className="case-nav" onKeyDown={event => { if (event.key === "Escape" && open) { setOpen(false); button.current?.focus(); } }}>
    <p className="eyebrow">IN THIS STUDY</p>
    <button ref={button} type="button" className="contents-toggle" aria-expanded={open} aria-controls="case-contents-links" onClick={() => setOpen(!open)}>Contents<span>{sections.find(([id]) => id === active)?.[1] ?? "Choose a section"} {open ? "−" : "+"}</span></button>
    <nav id="case-contents-links" aria-label="Case study contents" data-open={open}>
      {sections.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={active === id ? "location" : undefined} onClick={() => {
        setOpen(false);
        // Focus follows the destination even when the compact menu collapses.
        const destination = document.getElementById(id);
        if (destination) { destination.tabIndex = -1; destination.focus({ preventScroll: true }); }
      }}>{label}</a>)}
    </nav>
  </aside>;
}

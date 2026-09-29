"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/** One shared header, with offsets that follow resizing and text zoom. */
export function PersistentHeader({ children }: { children: ReactNode }) {
  const header = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const element = header.current;
    if (!element) return;
    const measure = () => document.documentElement.style.setProperty("--site-header-height", `${element.getBoundingClientRect().height}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    let frame = 0;
    const revealFocus = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || element.contains(target) || target.classList.contains("skip-link")) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        const contents = document.querySelector<HTMLElement>(".case-nav");
        const contentsHeight = contents && window.matchMedia("(max-width: 899px)").matches && !contents.contains(target) ? contents.getBoundingClientRect().height : 0;
        const top = element.getBoundingClientRect().bottom + contentsHeight + 16;
        if (rect.top < top && rect.height < window.innerHeight - top) window.scrollBy({ top: rect.top - top, behavior: "instant" });
      });
    };
    document.addEventListener("focusin", revealFocus);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); document.removeEventListener("focusin", revealFocus); };
  }, []);
  return <header ref={header} className="site-header">{children}</header>;
}

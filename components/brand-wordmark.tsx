"use client";

import { useLayoutEffect, useRef } from "react";

/** Fit real text advances, keeping both typefaces at their natural proportions. */
export function BrandWordmark() {
  const group = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const element = group.current;
    if (!element) return;
    const name = element.querySelector<HTMLElement>(".wordmark-name")!;
    const tagline = element.querySelector<HTMLElement>(".wordmark-tagline")!;
    const separator = tagline.querySelectorAll<HTMLElement>("span")[1];
    const brand = element.closest<HTMLElement>(".wordmark")!;
    const row = element.closest<HTMLElement>(".header-inner")!;
    const range = document.createRange();
    const width = (node: HTMLElement) => { range.selectNodeContents(node); return range.getBoundingClientRect().width; };
    let active = true;
    const fit = () => {
      name.style.fontSize = "";
      tagline.style.fontSize = "";
      tagline.style.letterSpacing = "";
      separator.style.letterSpacing = "";
      const logo = brand.querySelector("svg")!.getBoundingClientRect().width;
      const available = brand.clientWidth - logo - parseFloat(getComputedStyle(brand).columnGap);
      const natural = width(name);
      if (natural > available && available > 0) name.style.fontSize = `${parseFloat(getComputedStyle(name).fontSize) * available / natural}px`;
      const target = width(name);
      // Font size provides almost all of the fit; subpixel tracking corrects rounding.
      for (let i = 0; i < 3; i++) tagline.style.fontSize = `${parseFloat(getComputedStyle(tagline).fontSize) * target / width(tagline)}px`;
      const characters = Array.from(tagline.textContent ?? "").length;
      for (let i = 0; i < 4; i++) {
        const difference = target - width(tagline);
        if (Math.abs(difference) < 0.001) break;
        tagline.style.letterSpacing = `${parseFloat(getComputedStyle(tagline).letterSpacing) + difference / characters}px`;
      }
      // Browser text runs quantize total tracking differently. One separator's
      // advance supplies the final fraction of a pixel without changing spaces.
      for (let i = 0; i < 4; i++) {
        const difference = target - width(tagline);
        if (Math.abs(difference) < 0.001) break;
        separator.style.letterSpacing = `${parseFloat(getComputedStyle(separator).letterSpacing) + difference}px`;
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(row);
    window.addEventListener("resize", fit);
    document.fonts.addEventListener("loadingdone", fit);
    void document.fonts.ready.then(() => { if (active) fit(); });
    return () => { active = false; observer.disconnect(); window.removeEventListener("resize", fit); document.fonts.removeEventListener("loadingdone", fit); };
  }, []);
  return <span className="wordmark-type" ref={group}>
    <span className="wordmark-name">Michael P. Gibb,<span className="wordmark-credential"> Ph.D.</span></span>
    <span className="wordmark-tagline">Analytics <span>•</span> AI <span>•</span> Leadership</span>
  </span>;
}

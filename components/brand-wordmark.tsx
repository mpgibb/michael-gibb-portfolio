"use client";

import { useLayoutEffect, useRef } from "react";

/** Match intrinsic text advances using font size alone, with readable reflow. */
export function BrandWordmark() {
  const group = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const element = group.current;
    if (!element) return;
    const name = element.querySelector<HTMLElement>(".wordmark-name")!;
    const tagline = element.querySelector<HTMLElement>(".wordmark-tagline")!;
    const row = element.closest<HTMLElement>(".header-inner")!;
    let active = true;
    let frame = 0;
    let observedWidth = -1;
    let observedRootSize = -1;
    const width = (node: HTMLElement) => node.getBoundingClientRect().width;
    const fit = () => {
      frame = 0;
      if (!active || !row.clientWidth) return;
      delete row.dataset.brandLayout;
      name.style.fontSize = "";
      tagline.style.fontSize = "";
      const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const namePreferred = parseFloat(getComputedStyle(element).getPropertyValue("--masthead-name-rem")) * rootSize;
      const taglineMinimum = parseFloat(getComputedStyle(tagline).fontSize);
      // Rem values retain the user's text-size preference between fitting events.
      const size = (node: HTMLElement, pixels: number) => { node.style.fontSize = `${pixels / rootSize}rem`; return width(node); };
      const naturalName = size(name, namePreferred);
      const minimumWidth = Math.max(size(name, namePreferred * 5 / 6), width(tagline));
      let available = width(element);
      if (minimumWidth > available) {
        row.dataset.brandLayout = "stack-controls";
        available = width(element);
      }
      if (minimumWidth > available) {
        // Enlarged text must reflow instead of being fitted back to ordinary size.
        row.dataset.brandLayout = "reflow";
        name.style.fontSize = "";
        tagline.style.fontSize = "";
        return;
      }
      const target = Math.min(available, Math.max(naturalName, minimumWidth));
      const fitWidth = (node: HTMLElement, targetWidth: number, minimum: number, preferred: number) => {
        let low = minimum;
        let high = Math.max(preferred, minimum);
        while (size(node, high) < targetWidth && high < preferred * 4) high *= 1.5;
        let best = low;
        let error = Math.abs(size(node, low) - targetWidth);
        const highError = Math.abs(size(node, high) - targetWidth);
        if (highError < error) { best = high; error = highError; }
        for (let i = 0; i < 20; i++) {
          const middle = (low + high) / 2;
          const actual = size(node, middle);
          const difference = Math.abs(actual - targetWidth);
          if (difference < error) { best = middle; error = difference; }
          if (actual < targetWidth) low = middle; else high = middle;
        }
        return size(node, best);
      };
      const nameWidth = fitWidth(name, target, namePreferred * 5 / 6, namePreferred);
      fitWidth(tagline, nameWidth, taglineMinimum, namePreferred);
    };
    const schedule = () => { if (active && !frame) frame = requestAnimationFrame(fit); };
    fit();
    // The header's assigned inline size does not depend on fitted text widths.
    const observer = new ResizeObserver(() => {
      const currentWidth = row.getBoundingClientRect().width;
      const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      if (currentWidth !== observedWidth || rootSize !== observedRootSize) {
        observedWidth = currentWidth;
        observedRootSize = rootSize;
        schedule();
      }
    });
    observer.observe(row);
    window.addEventListener("resize", schedule);
    document.fonts.addEventListener("loadingdone", schedule);
    void document.fonts.ready.then(schedule);
    return () => {
      active = false;
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      document.fonts.removeEventListener("loadingdone", schedule);
    };
  }, []);
  return <span className="wordmark-type" ref={group}>
    <span className="wordmark-name">Michael P. Gibb,<span className="wordmark-credential"> Ph.D.</span></span>
    <span className="wordmark-tagline">Analytics{" "}<span className="wordmark-dot" aria-hidden="true">•</span>{" "}AI{" "}<span className="wordmark-dot" aria-hidden="true">•</span>{" "}<span className="wordmark-final-phrase">Technology Leadership</span></span>
  </span>;
}

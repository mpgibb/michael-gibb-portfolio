"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/** Same-page anchors must still work when their hash is already in the URL. */
export function SectionLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return <Link href={href} className={className} onClick={event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(href, window.location.href);
    if (url.pathname !== window.location.pathname || !url.hash) return;
    const destination = document.getElementById(url.hash.slice(1));
    if (!destination) return;
    event.preventDefault();
    if (url.href !== window.location.href) window.history.pushState(null, "", url);
    destination.focus({ preventScroll: true });
    destination.scrollIntoView({ block: "start", behavior: "instant" });
  }}>{children}</Link>;
}

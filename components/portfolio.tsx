import { PreferencesButton } from "./experience/entry";
import Link from "next/link";
import { SectionLink } from "./section-link";
import { PersistentHeader } from "./persistent-header";
import { SkylineMark } from "./skyline-mark";
import { SiteNavigation } from "./site-navigation";
import { BrandWordmark } from "./brand-wordmark";
import { programStudies } from "@/lib/program-registry";
import { MapPin, ArrowUpRight } from "lucide-react";

export function Header() {
  return (
    <PersistentHeader>
      <div className="shell header-inner">
        <Link className="wordmark" href="/" aria-label="Michael P. Gibb, Ph.D. — Home">
          <SkylineMark />
          <BrandWordmark />
        </Link>
        <SiteNavigation studies={programStudies.map(({ id, title, industry, question, methods, methodSummary, slug, executionStatus, publicationStatus }) => ({ id, title, industry, question, methods, methodSummary, slug, executionStatus, publicationStatus }))} />
      </div>
    </PersistentHeader>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-grid">
          <div className="footer-brand"><strong>Michael P. Gibb, Ph.D.</strong><p>Analytics <span>•</span> AI <span>•</span> Leadership</p><p className="icon-link"><MapPin aria-hidden="true" />Chicago, Illinois</p></div>
          <nav aria-label="Footer navigation"><Link href="/research">Industries</Link><SectionLink href="/#approach">Approach</SectionLink><SectionLink href="/#about">Leadership</SectionLink><SectionLink className="icon-link" href="/#contact">Contact <ArrowUpRight aria-hidden="true" /></SectionLink></nav>
          <a className="icon-link footer-linkedin" href="https://www.linkedin.com/in/mp-gibb/" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.5 3a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3.5 10h4v11h-4ZM10 10h4v1.5c.7-1.1 1.8-1.8 3.4-1.8 3 0 4.1 1.9 4.1 5V21h-4v-5.6c0-1.5-.4-2.4-1.7-2.4-1.4 0-1.8 1-1.8 2.4V21h-4Z" /></svg>Connect on LinkedIn</a>
        </div>
        <div className="footer-legal"><p>© {new Date().getFullYear()} Michael P. Gibb. All rights reserved.</p><nav aria-label="Legal"><PreferencesButton /><Link href="/privacy">Privacy</Link><Link href="/terms">Terms &amp; Disclosures</Link></nav></div>
        <p className="footer-disclaimer">Independent portfolio. Research findings and scenario assumptions do not guarantee future outcomes.</p>
      </div>
    </footer>
  );
}

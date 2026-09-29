import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/portfolio";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Research by industry",
  description: "Reproducible commercial studies in marketing, revenue forecasting, customer value and operational planning, with executive summaries and evaluated synthetic evidence.",
  alternates: { canonical: "/research" },
};

export default function ResearchPage() {
  return <><Header /><main id="main" tabIndex={-1}>
    <section className="project-hero"><div className="shell"><Link className="back-link" href="/">← Home</Link><p className="eyebrow">APPLIED RESEARCH</p><h1>A business question.<br />A complete body of evidence.</h1><p className="project-question">Explore by industry. Start with the executive summary, then follow the evidence through the methods, stress tests and reproducible source.</p></div></section>
    <div className="shell research-collections">
      <section id="commercial" className="section"><div className="section-heading"><div><p className="eyebrow">01 / COMMERCIAL</p><h2>Customers, revenue<br />and operations.</h2></div><p className="reading">Four completed synthetic studies connect a specific decision to tested methods and measured outcomes. Results describe simulations; they do not establish client impact. Independent technical review remains pending.</p></div>
        <div className="collection-grid">{projects.map(p => <article key={p.slug}><p className="eyebrow">{p.category}</p><h3><Link href={`/projects/${p.slug}`}>{p.title}</Link></h3><p>{p.short}</p><p className="project-status">{p.status}</p><Link className="text-link" href={`/projects/${p.slug}#executive-summary`}>Read the executive summary ↗</Link><Link className="source-link" href={`/projects/${p.slug}#evidence`}>Explore the evidence ↗</Link></article>)}</div>
      </section>
      <section id="sports" className="future-collection"><div><p className="eyebrow">02 / SPORTS ANALYTICS</p><h2>The next field of questions.</h2></div><div><p>Reserved for future work on sports decisions. No completed study is published in this collection yet.</p><span className="project-status">Future collection</span></div></section>
      <section id="other-industries" className="future-collection"><div><p className="eyebrow">03 / OTHER INDUSTRIES</p><h2>Room for the next application.</h2></div><div><p>Additional industries will be added when there is a defined decision, appropriate data and a reviewable study.</p><span className="project-status">Future collection</span></div></section>
    </div>
  </main><Footer /></>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/portfolio";
import { projects } from "@/lib/projects";
import results from "@/lib/marketing-results.json";
import { publishedStudies } from "@/lib/program-registry";
export const metadata: Metadata = { alternates: { canonical: "/" } };
export default function Home() {
  const flagship = projects[0];
  return <><Header /><main tabIndex={-1} id="main">
    <section className="hero">
      <div className="shell hero-grid">
        <div><p className="eyebrow">MICHAEL P. GIBB, PH.D. · CHICAGO</p>
          <h1>Analytics and AI leadership for <em>growth and better business decisions.</em></h1>
          <p className="hero-copy">Statistical rigor, technical leadership and a clear commercial question. I connect analytical work to decisions about customers, revenue and the operations that support them.</p>
          <a className="button-light" href="#work">Explore the research <span aria-hidden="true">↘</span></a>
        </div>
        <aside className="hero-aside"><span className="aside-rule" /><p className="mono">COMMERCIAL APPLICATIONS</p><p>Marketing effectiveness.<br />Revenue confidence.<br />Customer value.<br />Operational planning.</p><div className="aside-bottom">Analytics · AI · Machine learning<br /><span>Evidence before scale.</span></div></aside>
      </div>
      <div className="shell hero-foot"><span>From a business question to a defensible decision.</span><span className="mono">LEADERSHIP + APPLIED RESEARCH</span></div>
    </section>
    <section className="shell leadership section" id="about">
      <div className="section-heading"><div><p className="eyebrow">LEADERSHIP FOUNDATION</p><h2>Depth in the methods.<br />Clarity in the work.</h2></div><p className="reading">My background spans enterprise analytics, applied machine learning and technical program leadership. I lead analytical teams and technical programs that connect statistical work to organizational priorities.</p></div>
      <div className="leadership-grid">
        <div><span className="index">STATISTICAL DEPTH</span><h3>Ph.D.</h3><p>Applied multivariate statistics</p></div>
        <div><span className="index">TEAM LEADERSHIP</span><h3>Analytical teams</h3><p>Connect methods, people and operational priorities</p></div>
        <div><span className="index">TECHNICAL DIRECTION</span><h3>Enterprise analytics</h3><p>Guide analytical work in complex organizations</p></div>
      </div>
      <a className="text-link leadership-link" href="https://www.linkedin.com/in/mp-gibb/" target="_blank" rel="noreferrer">Professional background on LinkedIn ↗</a>
    </section>
    <section className="work-section" id="work"><div className="shell">
      <div className="work-heading"><div><p className="eyebrow">COMMERCIAL RESEARCH</p><h2>Evidence for the<br />next business decision.</h2></div><p className="section-intro">Evaluated public-data research and four synthetic demonstrations, each with an executive summary, reproducible source and visible limitations. These are portfolio studies, not claims of delivered client results.</p></div>
      <article className="flagship-card"><div><p className="eyebrow">01 / FLAGSHIP · MARKETING EFFECTIVENESS</p><h3><Link href={`/projects/${flagship.slug}`}>Measure what the campaign actually changes.</Link></h3><p>{flagship.short}</p><p className="project-status">{flagship.status}</p><div className="project-links"><Link className="text-link" href={`/projects/${flagship.slug}`}>Read the study & explore results ↗</Link><a className="source-link" href={flagship.repository}>Reproduce on GitHub ↗</a></div></div>
        <div className="flagship-result"><p className="mono">SYNTHETIC EXPERIMENT · 6,000 CUSTOMERS</p><strong>${results.estimates.adjusted.estimate.toFixed(2)}</strong><p>Estimated incremental contribution per customer</p><div className="interval-mark" aria-hidden="true"><span /><i /><span /></div><p className="result-interval">95% interval: ${results.estimates.adjusted.ci_low.toFixed(2)}–${results.estimates.adjusted.ci_high.toFixed(2)}</p><p className="caption">Known simulated effect: $8.00. Not actual business impact.</p></div>
      </article>
      <div className="research-grid">{publishedStudies.filter(study => ["S28", "S02", "S04", "S58", "S43"].includes(study.id)).map(study => <article key={study.id}><p className="eyebrow">{study.id} / PUBLIC-DATA RESEARCH</p><h3><Link href={`/research/${study.slug}`}>{study.title}</Link></h3><p>{study.id === "S43" ? "A later-sale property evaluation finds no clear accuracy upgrade and substantial local interval gaps. Explore historical township and property-size evidence." : study.id === "S58" ? "Detailed workflow history yields a modest 1.6% forecasting gain. Explore stage delays, late-case prioritization and the assumptions behind capacity scenarios." : study.id === "S28" ? "A simple contact-history rule beats the selected response model in a chronological bank-campaign holdout. Explore the measured tradeoff and assumed economics." : study.id === "S04" ? "An independent advertising benchmark finds no demonstrated uplift advantage over response targeting. Compare capacity, uncertainty and explicit economic assumptions." : "A retail forecasting comparison improves cycle accuracy by 17.4%. Explore why lower simulated inventory cost can still mean more missed sales."}</p><p className="project-status">Evaluated public-data study</p><Link className="text-link" href={`/research/${study.slug}`}>Read the finding & executive summary ↗</Link></article>)}</div>
    <p className="collection-link"><Link className="text-link" href="/research">Browse research by industry →</Link></p></div></section>
    <section className="shell practice section" id="approach"><div className="section-heading"><p className="eyebrow">HOW I APPROACH THE WORK</p><h2>The method should serve<br />the decision.</h2></div><div className="practice-grid">
      <article><span className="index">01</span><h3>Define the commercial question</h3><p>Connect marketing effectiveness and customer acquisition, sales forecasts, retention or capacity planning to a concrete decision, owner and evaluation criterion.</p></article>
      <article><span className="index">02</span><h3>Use the right evidence</h3><p>Distinguish prediction from causation. Compare practical baselines, preserve information available at decision time, and quantify the uncertainty that matters.</p></article>
      <article><span className="index">03</span><h3>Lead toward responsible use</h3><p>Make assumptions and limitations legible. Apply AI and machine learning where they improve the work, with human judgment, reproducibility and clear accountability.</p></article>
    </div></section>
    <section className="contact-section" id="contact"><div className="shell contact-inner"><div><p className="eyebrow">LET’S CONNECT</p><h2>Lead the work.<br />Improve the decision.</h2><p className="contact-copy">Director / VP opportunities in analytics, AI, data science and technical leadership.</p></div><a className="button-light" href="mailto:mike@michaelpgibb.com">Email Michael <span aria-hidden="true">↗</span></a></div></section>
  </main><Footer /></>;
}

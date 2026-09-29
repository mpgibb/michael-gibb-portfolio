import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/portfolio";
import { inventoryResult } from "@/lib/inventory-results";
import { SignalField } from "@/components/signal-field";
import { publishedStudies } from "@/lib/program-registry";
export const metadata: Metadata = { alternates: { canonical: "/" } };
export default function Home() {
  const flagship = publishedStudies.find(study => study.id === "S02")!;
  const base = inventoryResult.metrics.find(row => row.model === "seasonal_28" && row.name === "weighted_scaled_error_28d")!.estimate;
  const advanced = inventoryResult.metrics.find(row => row.model === "quantile_boosting" && row.name === "weighted_scaled_error_28d")!.estimate;
  return <><Header /><main tabIndex={-1} id="main">
    <section className="hero">
      <div className="shell hero-grid">
        <div className="hero-message"><p className="eyebrow">CHICAGO • OPEN TO REMOTE</p>
          <h1>Analytics and AI leadership for growth and better business decisions.</h1>
          <p className="hero-copy">Statistical rigor. Technical leadership. Commercial impact.</p>
          <div className="hero-actions"><a className="button-light button-primary" href="#work">Explore my work</a><a className="button-light button-secondary" href="#contact">Get in touch</a></div>
        </div>
        <SignalField />
      </div>
    </section>
    <section className="shell commercial-applications" aria-labelledby="applications-heading">
      <h2 id="applications-heading">Commercial applications</h2>
      <div className="applications-grid">
        <article><h3>Marketing effectiveness</h3><p>Connect customer acquisition and investment decisions to evidence about incremental impact.</p></article>
        <article><h3>Sales intelligence</h3><p>Build revenue confidence through forecasting, prioritization and a clear commercial question.</p></article>
        <article><h3>Customer value</h3><p>Understand purchase patterns, customer growth and retention with visible uncertainty.</p></article>
        <article><h3>Business operations</h3><p>Inform inventory, capacity and operational planning with practical analytical evidence.</p></article>
      </div>
      <p className="applications-principle">I connect analytical work to decisions about customers, revenue and the operations that support them. <span>Evidence before scale.</span></p>
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
      <article className="flagship-card"><div><p className="eyebrow">S02 / FEATURED · RETAIL INVENTORY</p><h3><Link href={`/research/${flagship.slug}`}>A better forecast still needs a better inventory decision.</Link></h3><p>Compare recorded retail sales forecasts, coherent uncertainty and the service-versus-cost tradeoff under explicit planning assumptions.</p><p className="project-status">Evaluated public-data study</p><div className="project-links"><Link className="text-link" href={`/research/${flagship.slug}`}>Read the finding & executive summary ↗</Link><a className="source-link" href={flagship.codeUrl!}>Reproduce on GitHub ↗</a></div></div>
        <div className="flagship-result"><p className="mono">M5 RETAIL DATA · 210 PRODUCT/STORE SERIES</p><strong>{(100*(1-advanced/base)).toFixed(1)}%</strong><p>Lower final cycle forecast error</p><div className="interval-mark" aria-hidden="true"><span /><i /><span /></div><p className="result-interval">Error: {base.toFixed(4)} → {advanced.toFixed(4)} across four final windows</p><p className="caption">Recorded sales are not unconstrained demand. Inventory costs are scenario assumptions.</p></div>
      </article>
      <div className="research-grid">{publishedStudies.filter(study => ["S28", "S04", "S58", "S43", "S13"].includes(study.id)).map(study => <article key={study.id}><p className="eyebrow">{study.id} / PUBLIC-DATA RESEARCH</p><h3><Link href={`/research/${study.slug}`}>{study.title}</Link></h3><p>{study.id === "S13" ? "A sensor-screening comparison finds weak later-month failure detection. Explore inspection capacity, probability calibration and unstable sensor selection." : study.id === "S43" ? "A later-sale property evaluation finds no clear accuracy upgrade and substantial local interval gaps. Explore historical township and property-size evidence." : study.id === "S58" ? "Detailed workflow history yields a modest 1.6% forecasting gain. Explore stage delays, late-case prioritization and the assumptions behind capacity scenarios." : study.id === "S28" ? "A simple contact-history rule beats the selected response model in a chronological bank-campaign holdout. Explore the measured tradeoff and assumed economics." : study.id === "S04" ? "An independent advertising benchmark finds no demonstrated uplift advantage over response targeting. Compare capacity, uncertainty and explicit economic assumptions." : "A retail forecasting comparison improves cycle accuracy by 17.4%. Explore why lower simulated inventory cost can still mean more missed sales."}</p><p className="project-status">Evaluated public-data study</p><Link className="text-link" href={`/research/${study.slug}`}>Read the finding & executive summary ↗</Link></article>)}</div>
    <p className="collection-link"><Link className="text-link" href="/research">Browse research by industry →</Link></p></div></section>
    <section className="shell practice section" id="approach"><div className="section-heading"><p className="eyebrow">HOW I APPROACH THE WORK</p><h2>The method should serve<br />the decision.</h2></div><div className="practice-grid">
      <article><span className="index">01</span><h3>Define the commercial question</h3><p>Connect marketing effectiveness and customer acquisition, sales forecasts, retention or capacity planning to a concrete decision, owner and evaluation criterion.</p></article>
      <article><span className="index">02</span><h3>Use the right evidence</h3><p>Distinguish prediction from causation. Compare practical baselines, preserve information available at decision time, and quantify the uncertainty that matters.</p></article>
      <article><span className="index">03</span><h3>Lead toward responsible use</h3><p>Make assumptions and limitations legible. Apply AI and machine learning where they improve the work, with human judgment, reproducibility and clear accountability.</p></article>
    </div></section>
    <section className="contact-section" id="contact"><div className="shell contact-inner"><div><p className="eyebrow">LET’S CONNECT</p><h2>Lead the work.<br />Improve the decision.</h2><p className="contact-copy">Director / VP opportunities in analytics, AI, data science and technical leadership.</p></div><a className="button-light" href="mailto:mike@michaelpgibb.com">Email Michael <span aria-hidden="true">↗</span></a></div></section>
  </main><Footer /></>;
}

import { CaseContents } from "@/components/case-contents";
import { StudyNextSteps } from "@/components/study-next-steps";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/lib/projects";
import results from "@/lib/marketing-results.json";
import { Footer } from "@/components/portfolio";
import { FlagshipEvidence } from "@/components/flagship-evidence";
import { CommercialEvidence } from "@/components/commercial-evidence";

export function generateStaticParams() { return projects.map(p => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projects.find(p => p.slug === slug);
  if (!p) notFound();
  return { title: p.title, description: p.short, alternates: { canonical: `/projects/${slug}` } };
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projects.find(p => p.slug === slug);
  if (!p) notFound();
  const flagship = p.slug === "marketing-incrementality";
  const executive = p.executive;
  return <><main tabIndex={-1} id="main">
    <section className="project-hero"><div className="shell"><Link className="back-link" href="/research#commercial">← Commercial research</Link><p className="eyebrow">{p.category}</p><h1>{p.title}</h1><p className="project-question">{p.question}</p><div className="project-hero-foot"><span className="status-light">{p.status}</span><a className="button-light" href="#executive-summary">Executive summary ↓</a></div></div></section>
    <div className="shell case-layout"><CaseContents demonstration />
    <article className="case-body">
      <section id="executive-summary" className="executive-summary"><p className="eyebrow">EXECUTIVE SUMMARY / THE DECISION IN PLAIN LANGUAGE</p><h2>{executive.headline}</h2><p className="summary-scope">Evaluated synthetic study · no actual client outcomes</p><p className="reading">{executive.finding}</p><div className="executive-stats">{executive.stats.map(stat => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div><div className="executive-takeaway"><h3>What a leader should do next</h3><p>{executive.decision}</p></div><div className="executive-caution"><h3>What could change the decision</h3><p>{executive.caution}</p></div><a className="text-link" href="#interactive-results">Explore the interactive results ↓</a></section>
      <section id="decision"><p className="eyebrow">01 / BUSINESS DECISION</p><h2>Start with the decision.</h2><p className="reading">{p.decision}</p></section>
      <section id="implication"><p className="eyebrow">02 / PRACTICAL IMPLICATION</p><h2>What the evidence can support.</h2><p className="reading">{p.implication}</p></section>
      <section id="evidence"><p className="eyebrow">03 / EVIDENCE</p><h2>{flagship ? "Campaign effect and cost uncertainty." : slug === "revenue-forecasting" ? "Revenue forecasts under changing sales conditions." : slug === "customer-value" ? "Retention predictions and intervention value." : "Staffing cost and service tradeoffs."}</h2><div className="evidence-note"><strong>{p.status}</strong><p>{p.baseline}</p></div>{flagship ? <FlagshipEvidence /> : <CommercialEvidence slug={slug} />}</section>
      <section id="data"><p className="eyebrow">04 / DATA</p><h2>Know where the evidence comes from.</h2><p className="reading">{p.data}</p>{flagship ? <><p>Study seed: {results.config.seed}. Independent historical seed: {results.config.historical_seed}. Monetary inputs are generated to six decimal places. Outcome and oracle files are separate; the estimator never reads potential outcomes or known treatment effects.</p><details><summary>Data process, version and provenance</summary><p>Within segment s ∈ &#123;0, 1&#125;, pre-period contribution X follows Gamma(4, 25 + 10s). Untreated contribution is 20 + 0.6X + 25s + normal noise with standard deviation 30 + 10s. Assignment adds 6 + 4s dollars. Equal segment weights give an average effect of $8. The historical cohort follows the untreated process independently.</p><p>CSV files, configuration and source hashes are recorded in the result JSON. The protocol documents null, weak-covariate and skewed-noise variants. This process supplies no evidence about an actual customer population.</p></details></> : <p>The source includes a data dictionary, fixed configuration and seed, original data generator, observed CSVs, evaluation outputs and source/data hashes. <a className="text-link" href={`${p.repository}/blob/main/DATA.md`}>Read the data dictionary ↗</a></p>}<p><a className="text-link" href={`/downloads/${p.resultFile}`}>Inspect full results and provenance hashes ↓</a></p></section>
      <section id="methodology"><p className="eyebrow">05 / METHODOLOGY</p><h2>Match the method to the design.</h2><p className="reading">{p.method}</p>{flagship ? <><p>Historical coefficients are frozen before experimental analysis. Stratum weights equal their sample shares; estimated variance sums squared weights times the two arm variances divided by their sample sizes. All randomized customers remain in the analysis.</p><p><a className="text-link" href="https://ai.stanford.edu/~ronnyk/2013-02CUPEDImprovingSensitivityOfControlledExperiments.pdf">Deng et al. (2013), pre-experiment variance reduction ↗</a></p></> : <><h3>Evaluation design</h3><ul className="evaluation-list">{p.evaluation.map(item => <li key={item}>{item}</li>)}</ul><div className="method-references">{p.references?.map(reference => <p key={reference.url}><a className="text-link" href={reference.url}>{reference.title} ↗</a></p>)}</div><p className="caption">References motivate the methods. These study-specific implementations do not claim every assumption or theoretical guarantee of the cited work.</p></>}</section>
      <section id="limitations"><p className="eyebrow">06 / LIMITATIONS</p><h2>Conditions that matter.</h2><ul className="evaluation-list">{p.assumptions.map(a => <li key={a}>{a}</li>)}</ul><p className="reading">{p.limitations}</p></section>
      <section id="code"><p className="eyebrow">07 / CODE & NEXT STEPS</p><h2>Reproduce the result.</h2><div className="code-label mono">PYTHON 3.11.16 · {flagship ? "STANDARD LIBRARY" : "LOCKED NUMPY / SCIPY"} · FIXED SEEDS</div><pre><code>{`git clone https://github.com/mpgibb/${slug}.git\ncd ${slug}\nuv sync --frozen\nuv run python -m unittest discover -s tests -v\nuv run python study.py\ngit diff --exit-code -- data results`}</code></pre><div className="project-links"><a className="text-link" href={p.repository}>Study source ↗</a><a className="text-link" href={`/downloads/${slug}.zip`}>Download reproducible study ↓</a><a className="text-link" href={`/downloads/${p.resultFile}`}>Full results JSON ↓</a>{!flagship && <a className="text-link" href={`${p.repository}/blob/main/REPORT.md`}>Full research report ↗</a>}</div><p className="caption review-status">Automated checks and synthetic evaluation are complete; Michael’s independent technical review is pending.</p><div className="next-step"><h3>Next step</h3><p>{p.next}</p></div></section>
      <StudyNextSteps id={slug} />
    </article></div>
  </main><Footer /></>;
}

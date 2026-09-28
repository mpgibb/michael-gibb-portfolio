import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/lib/projects";
import results from "@/lib/marketing-results.json";
import { Header, Footer } from "@/components/portfolio";
import { FlagshipEvidence } from "@/components/flagship-evidence";
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
  return <><Header /><main tabIndex={-1} id="main">
    <section className="project-hero"><div className="shell"><Link className="back-link" href="/#work">← Commercial research</Link><p className="eyebrow">{p.category}</p><h1>{p.title}</h1><p className="project-question">{p.question}</p><div className="project-hero-foot"><span className="status-light">{p.status}</span>{p.repository && <a className="button-light" href={p.repository}>Reproduce on GitHub ↗</a>}</div></div></section>
    <div className="shell case-layout"><aside className="case-nav"><p className="eyebrow">IN THIS PROJECT</p><nav aria-label="Case study contents"><a href="#decision">Business decision</a><a href="#implication">Practical implication</a><a href="#evidence">Evidence</a><a href="#data">Data</a><a href="#methodology">Methodology</a><a href="#limitations">Limitations</a><a href="#code">Code & next steps</a></nav></aside>
    <article className="case-body">
      <section id="decision"><p className="eyebrow">01 / BUSINESS DECISION</p><h2>Start with the decision.</h2><p className="reading">{p.decision}</p></section>
      <section id="implication"><p className="eyebrow">02 / PRACTICAL IMPLICATION</p><h2>What the evidence can support.</h2><p className="reading">{p.implication}</p></section>
      <section id="evidence"><p className="eyebrow">03 / EVIDENCE</p><h2>{flagship ? "An evaluated demonstration." : "A defined question. Work still ahead."}</h2><div className="evidence-note"><strong>{p.status}</strong><p>{p.baseline}</p></div>{flagship ? <FlagshipEvidence /> : <><h3>Planned evaluation</h3><ul className="evaluation-list">{p.evaluation.map(e=><li key={e}>{e}</li>)}</ul><p className="caption">No evaluated result, client impact or live model is claimed for this planned study.</p></>}</section>
      <section id="data"><p className="eyebrow">04 / DATA</p><h2>Know where the evidence comes from.</h2><p className="reading">{p.data}</p>{flagship && <><p>Study seed: {results.config.seed}. Independent historical seed: {results.config.historical_seed}. Monetary inputs are generated to six decimal places. Outcome and oracle files are separate; the estimator never reads potential outcomes or known treatment effects.</p><details><summary>Data process, version and provenance</summary><p>Within segment s ∈ &#123;0, 1&#125;, pre-period contribution X follows Gamma(4, 25 + 10s). Untreated contribution is 20 + 0.6X + 25s + normal noise with standard deviation 30 + 10s. Assignment adds 6 + 4s dollars. Equal segment weights give an average effect of $8. The historical cohort follows the untreated process independently.</p><p>CSV files, configuration and source hashes are recorded in <a className="text-link" href="/downloads/marketing-results.json">the result JSON</a>. The generator and protocol document the null, weak-covariate and skewed-noise variants. This synthetic process supplies no evidence about any actual customer population.</p></details></>}</section>
      <section id="methodology"><p className="eyebrow">05 / METHODOLOGY</p><h2>Match the method to the design.</h2><p className="reading">{p.method}</p>{flagship && <><p>Historical coefficients are frozen before experimental analysis. Stratum weights equal their sample shares; estimated variance is the sum of squared weights times the two arm variances divided by their respective sample sizes. All randomized customers remain in the intention-to-treat analysis.</p><p><a className="text-link" href="https://ai.stanford.edu/~ronnyk/2013-02CUPEDImprovingSensitivityOfControlledExperiments.pdf">Method reference: Deng et al. (2013), pre-experiment variance reduction ↗</a></p></>}</section>
      <section id="limitations"><p className="eyebrow">06 / LIMITATIONS</p><h2>Conditions that matter.</h2><ul className="evaluation-list">{p.assumptions.map(a=><li key={a}>{a}</li>)}</ul><p className="reading">{p.limitations}</p></section>
      <section id="code"><p className="eyebrow">07 / CODE & NEXT STEPS</p><h2>{flagship ? "Reproduce the result." : "The next useful piece of work."}</h2>{p.repository ? <><div className="code-label mono">PYTHON 3.11.16 · STANDARD LIBRARY · FIXED SEEDS</div><pre><code>{`git clone https://github.com/mpgibb/marketing-incrementality.git\ncd marketing-incrementality\nuv sync --frozen\nuv run python -m unittest discover -s tests -v\nuv run python study.py`}</code></pre><div className="project-links"><a className="text-link" href={p.repository}>Study source ↗</a><a className="text-link" href="/downloads/marketing-incrementality.zip">Download reproducible study ↓</a><a className="text-link" href="/downloads/marketing-results.json">Full results JSON ↓</a></div><p className="caption review-status">Automated checks and synthetic evaluation are complete; Michael’s independent technical review is pending.</p></> : <p>Implementation has not begun. A repository and source download will be linked when they exist and contain reviewable work.</p>}<div className="next-step"><h3>Next step</h3><p>{p.next}</p></div></section>
      <Link className="text-link" href="/#work">← All commercial research</Link>
    </article></div>
  </main><Footer /></>;
}

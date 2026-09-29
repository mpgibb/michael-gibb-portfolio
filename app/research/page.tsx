import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/portfolio";
import { ResearchCatalog } from "@/components/research-catalog";
import { projects } from "@/lib/projects";
import { programStudies } from "@/lib/program-registry";

export const metadata: Metadata = {
  title: "Research by industry",
  description: "Decision-focused research across 20 industries. Browse evaluated findings, reproducible demonstrations and a clearly labeled 60-study research agenda.",
  alternates: { canonical: "/research" },
};

export default async function ResearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const industry = typeof params.industry === "string" ? params.industry : "all";
  const status = typeof params.status === "string" ? params.status : "completed";
  const demonstrations = projects.map(project => ({ slug: project.slug, title: project.title, short: project.short, category: project.category, methods: project.slug === "marketing-incrementality" ? ["Causal inference"] : project.slug === "customer-value" ? ["Survival analysis", "Causal inference"] : ["Forecasting", "Optimization & simulation"], decisionType: ["marketing-incrementality", "customer-value"].includes(project.slug) ? "Targeting & customer value" : "Capacity & operations" }));
  return <><Header /><main id="main" tabIndex={-1}>
    <section className="project-hero"><div className="shell"><Link className="back-link" href="/">← Home</Link><p className="eyebrow">APPLIED RESEARCH</p><h1>A business question.<br />A complete body of evidence.</h1><p className="project-question">Start with the decision and finding. Explore the methods, uncertainty and reproducible source. Browse the research agenda for questions still being investigated.</p></div></section>
    <section id="commercial" className="shell section research-collections"><h2 className="catalog-title">Find the research behind the decision.</h2><ResearchCatalog key={`${industry}:${status}`} studies={programStudies} demonstrations={demonstrations} initialIndustry={industry} initialStatus={status} /></section>
  </main><Footer /></>;
}

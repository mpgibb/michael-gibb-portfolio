import { AskButton } from "@/components/experience/entry";
import type { Metadata } from "next";
import Link from "next/link";
import { ResearchCatalog, type CatalogFilters } from "@/components/research-catalog";
import { projects } from "@/lib/projects";
import { programStudies } from "@/lib/program-registry";

export const metadata: Metadata = {
  title: "Research by industry",
  description: "Decision-focused research across 20 industries. Browse evaluated findings, reproducible demonstrations and clearly labeled planned topics.",
  alternates: { canonical: "/research" },
};

export default async function ResearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const defaults: CatalogFilters = { q: "", industry: "all", area: "all", method: "all", decision: "all", status: "completed" };
  if (params.industry && !params.status) defaults.status = "all";
  const initialFilters = Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, typeof params[key] === "string" ? params[key] : value])) as CatalogFilters;
  const demonstrations = projects.map(project => ({ slug: project.slug, title: project.title, short: project.short, category: project.category, methods: project.slug === "marketing-incrementality" ? ["Causal inference"] : project.slug === "customer-value" ? ["Survival analysis", "Causal inference"] : ["Forecasting", "Optimization & simulation"], decisionType: ["marketing-incrementality", "customer-value"].includes(project.slug) ? "Targeting & customer value" : "Capacity & operations" }));
  return <><main id="main" tabIndex={-1}>
    <section className="catalog-hero"><div className="shell"><Link className="back-link" href="/">← Home</Link><p className="eyebrow">RESEARCH BY INDUSTRY</p><h1>Evidence for the decision.</h1><p>Find published research and synthetic demonstrations, with planned and developing topics clearly separated.</p></div></section>
    <section id="commercial" className="shell research-collections"><AskButton /><ResearchCatalog key={JSON.stringify(initialFilters)} studies={programStudies} demonstrations={demonstrations} initialFilters={initialFilters} /></section>
  </main></>;
}

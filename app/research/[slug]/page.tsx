import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactStudy } from "@/components/contact-study";
import { InventoryStudy } from "@/components/inventory-study";
import { publishedStudies } from "@/lib/program-registry";
import { productionOrigin } from "@/lib/site";

const descriptions: Record<string, string> = {
  S28: "A chronological bank-contact evaluation finds that a simple history rule outperforms the selected response model. Explore capacity and uncertainty.",
  S02: "A 210-series retail evaluation improves 28-day sales forecasts by 17.4%. Explore forecast bands and the explicitly simulated service–cost tradeoff.",
};
export const dynamicParams = false;
export function generateStaticParams() { return publishedStudies.map(study => ({ slug: study.slug })); }
function published(slug: string) {
  const study = publishedStudies.find(study => study.slug === slug);
  if (!study || !descriptions[study.id]) notFound();
  return study;
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const study = published((await params).slug);
  const description = descriptions[study.id];
  return { title: study.title, description, alternates: { canonical: `/research/${study.slug}` }, openGraph: { title: study.title, description, url: `${productionOrigin}/research/${study.slug}`, type: "article" } };
}
export default async function ResearchStudy({ params }: { params: Promise<{ slug: string }> }) {
  const study = published((await params).slug);
  if (study.id === "S28") return <ContactStudy study={study}/>;
  if (study.id === "S02") return <InventoryStudy study={study}/>;
  notFound();
}

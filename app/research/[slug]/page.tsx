import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InspectionStudy } from "@/components/inspection-study";
import { PropertyStudy } from "@/components/property-study";
import { WorkflowStudy } from "@/components/workflow-study";
import { ContactStudy } from "@/components/contact-study";
import { AdvertisingStudy } from "@/components/advertising-study";
import { InventoryStudy } from "@/components/inventory-study";
import { publishedStudies } from "@/lib/program-registry";
import { productionOrigin } from "@/lib/site";

const descriptions: Record<string, string> = {
  S13: "A chronological sensor-screening evaluation finds weak later-month failure detection. Explore inspection budgets, calibration and sensor-selection stability.",
  S43: "A forward Cook County sale-price evaluation finds no clear spatial-model accuracy gain and substantial local uncertainty gaps. Explore historical township evidence.",
  S58: "A workflow survival comparison reduces forecasting error by 1.6%. Explore application stages, review capacity and explicitly assumed staffing scenarios.",
  S04: "An independent corrected-release advertising benchmark finds no demonstrated uplift advantage over response targeting. Explore budget-specific estimates and uncertainty.",
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
  if (study.id === "S04") return <AdvertisingStudy study={study}/>;
  if (study.id === "S58") return <WorkflowStudy study={study}/>;
  if (study.id === "S13") return <InspectionStudy study={study}/>;
  if (study.id === "S43") return <PropertyStudy study={study}/>;
  notFound();
}

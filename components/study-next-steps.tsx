import { AskButton } from "./experience/entry";
import Link from "next/link";
import { SectionLink } from "./section-link";
import { publishedStudies } from "@/lib/program-registry";

const related: Record<string, string> = { S02: "S58", S03: "S47", S04: "S28", S13: "S02", S28: "S04", S31: "S43", S43: "S31", S47: "S03", S58: "S13", "marketing-incrementality": "S04", "customer-value": "S03", "revenue-forecasting": "S28", "operational-planning": "S02" };
export function StudyNextSteps({ id }: { id: string }) {
  const study = publishedStudies.find(item => item.id === related[id]) ?? publishedStudies.find(item => item.id !== id);
  return <div className="study-next-steps"><AskButton projectId={id} /><p className="eyebrow">CONTINUE THE CONVERSATION</p>{study && <p>Related evidence: <Link href={`/research/${study.slug}`}>{study.title} →</Link></p>}<p><SectionLink className="text-link" href="/#contact">Discuss an analytics leadership opportunity ↗</SectionLink></p><Link className="source-link" href="/research">All evaluated research →</Link></div>;
}

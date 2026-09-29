import { z } from "zod";
import catalog from "./program-catalog.json";

const publicUrl = z.string().url().regex(/^https:\/\//);
export const studySchema = z.object({
  id: z.string().regex(/^S[0-9]{2}$/), title: z.string().min(10), slug: z.string().regex(/^s[0-9]{2}-[a-z0-9-]+$/),
  industry: z.string().min(3), question: z.string().min(20), methods: z.array(z.string()).min(1),
  methodSummary: z.string(), decisionType: z.string(), design: z.string(), theory: z.string(), evaluation: z.string(), limitations: z.string(),
  dataset: z.object({ name: z.string(), publisher: z.string(), url: publicUrl, selectionRank: z.number().int().min(1).max(3) }).strict(),
  executionStatus: z.enum(["planned", "data_ready", "baseline_complete", "evaluated", "blocked"]),
  publicationStatus: z.enum(["unpublished", "draft", "published", "withheld"]),
  codeUrl: publicUrl.nullable(), resultFile: z.string().regex(/^S[0-9]{2}\.json$/).nullable(),
  publishedUrl: publicUrl.nullable(), updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).strict().superRefine((study, context) => {
  if (study.publicationStatus === "published" && (study.executionStatus !== "evaluated" || !study.resultFile || !study.codeUrl || !study.publishedUrl)) {
    context.addIssue({ code: "custom", message: "A published study requires evaluated evidence and source links." });
  }
});

export type ProgramStudy = z.infer<typeof studySchema>;
const registrySchema = z.array(studySchema).length(60).superRefine((studies, context) => {
  const ids = new Set(studies.map(study => study.id));
  if (ids.size !== 60 || Array.from({ length: 60 }, (_, i) => `S${String(i + 1).padStart(2, "0")}`).some(id => !ids.has(id))) context.addIssue({ code: "custom", message: "All 60 study IDs must occur exactly once." });
  if (new Set(studies.map(study => study.slug)).size !== 60 || new Set(studies.map(study => study.industry)).size !== 20) context.addIssue({ code: "custom", message: "Invalid study slugs or industry count." });
});
export const programStudies = registrySchema.parse(catalog);
export const publishedStudies = programStudies.filter(study => study.publicationStatus === "published");

import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { publishedStudies } from "@/lib/program-registry";
import { isPublicProduction, productionOrigin } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isPublicProduction) return [];
  return ["", "/research", "/privacy", "/terms", ...projects.map((p) => `/projects/${p.slug}`), ...publishedStudies.map(study => `/research/${study.slug}`)].map((path) => ({
    url: `${productionOrigin}${path}`,
  }));
}

import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { isPublicProduction, productionOrigin } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isPublicProduction) return [];
  return ["", ...projects.map((p) => `/projects/${p.slug}`)].map((path) => ({
    url: `${productionOrigin}${path}`,
  }));
}

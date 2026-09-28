import type { MetadataRoute } from "next";
import { isPublicProduction, productionOrigin } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  return isPublicProduction
    ? {
        rules: { userAgent: "*", allow: "/" },
        sitemap: `${productionOrigin}/sitemap.xml`,
      }
    : { rules: { userAgent: "*", disallow: "/" } };
}

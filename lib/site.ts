/** Trusted deploy-time origins only; never derive canonical URLs from request headers. */
export const productionOrigin =
  process.env.SITE_URL ?? "https://michaelpgibb.com";
export const isPublicProduction = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === "production"
  : process.env.INDEXABLE_PRODUCTION === "true";

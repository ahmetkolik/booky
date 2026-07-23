import type { MetadataRoute } from "next";
import appConfig from "@/app.config";

/** Public marketing + business booking pages are indexable; the authenticated
 *  workspace and API routes are not (no path prefix separates them, so each
 *  is listed explicitly). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/book/"],
      disallow: [
        "/api/",
        "/dashboard",
        "/calendar",
        "/clients",
        "/services",
        "/staff",
        "/settings",
        "/booking",
        "/onboarding",
      ],
    },
    sitemap: `https://${appConfig.domain}/sitemap.xml`,
  };
}

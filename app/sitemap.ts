import type { MetadataRoute } from "next";
import appConfig from "@/app.config";

/**
 * Static routes only. Once businesses are persisted in Supabase, query
 * published booking-page slugs and append a `/book/{slug}` entry per row.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${appConfig.domain}`;
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}

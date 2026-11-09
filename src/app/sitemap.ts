import type { MetadataRoute } from "next";
import { fetchCatalog } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await fetchCatalog();
  const productRoutes: MetadataRoute.Sitemap = Object.values(catalog)
    // The Duo has no page of its own (it is sold from /shop), so listing it would hand Google a 404.
    .filter((p) => p.slug !== "duo")
    .map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    ...productRoutes,
  ];
}

import type { MetadataRoute } from "next";
import { fetchCatalog } from "@/lib/catalog";

const SITE_URL = "https://mijab.shop";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await fetchCatalog();
  const productRoutes: MetadataRoute.Sitemap = Object.values(catalog).map((p) => ({
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

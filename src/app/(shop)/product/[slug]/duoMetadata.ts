import type { Metadata } from "next";
import { formatPrice, Product } from "@/lib/products";

const TITLE = "The Duo: Perfume Gift Set for Him & Her";

export function duoMetadata(duo: Product): Metadata {
  const saving = duo.compareAt && duo.compareAt > duo.price ? ` (save ${formatPrice(duo.compareAt - duo.price)})` : "";
  const description = `MIJAB Duo gift set: Café Noir for him and Vanilla Gourmand for her, two 50 ml eau de parfums for ${formatPrice(duo.price)}${saving}. A perfect couple's gift. Delivery across Pakistan, cash on delivery available.`;
  const images = [{ url: duo.image, alt: "MIJAB Duo: Café Noir and Vanilla Gourmand perfume gift set" }];
  return {
    title: TITLE,
    description,
    alternates: { canonical: "/product/duo" },
    openGraph: { type: "website", url: "/product/duo", siteName: "MIJAB", title: `${TITLE} · MIJAB`, description, images },
    twitter: { card: "summary_large_image", title: `${TITLE} · MIJAB`, description, images: [duo.image] },
  };
}

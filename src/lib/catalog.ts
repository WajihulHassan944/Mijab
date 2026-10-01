// Shared, non-"use client" module: safe to import from server components
// (product detail page, home page) and from the client-side store alike.
import { Product, ProductId, products as staticProducts } from "./products";
import { api, ApiProduct } from "./api";

export type Catalog = Record<string, Product>;

export function apiToProduct(p: ApiProduct): Product {
  return {
    id: p.slug as ProductId,
    slug: p.slug,
    name: p.name,
    audience: p.audience,
    tagline: p.tagline,
    blurb: p.blurb,
    description: p.description,
    price: p.price,
    compareAt: p.compareAt,
    image: p.image,
    swatch: p.swatch,
    bag: p.bag,
    bagLabel: p.bagLabel,
    bottle: p.bottle,
    notes: p.notes,
  };
}

/** Live catalog from the API, merged over the static seed so a failed fetch
 * (or a product missing a field) still renders something reasonable instead
 * of a blank page. */
export async function fetchCatalog(): Promise<Catalog> {
  try {
    const list = await api.products.list();
    return { ...staticProducts, ...Object.fromEntries(list.map((p) => [p.slug, apiToProduct(p)])) };
  } catch {
    return staticProducts;
  }
}

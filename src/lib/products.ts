export type ProductId = "cafe-noir" | "vanilla-gourmand" | "duo" | "perfume-wax";

export type Product = {
  id: ProductId;
  slug: string;
  name: string;
  audience: string;
  tagline: string;
  blurb: string;
  description: string;
  price: number;
  compareAt?: number;
  image: string;
  swatch: string;
  bag?: string;
  bagLabel?: string;
  bottle?: string;
  notes?: { top: string; heart: string; base: string };
  details?: string;
};

export const products: Record<ProductId, Product> = {
  "cafe-noir": {
    id: "cafe-noir",
    slug: "cafe-noir",
    name: "Café Noir",
    audience: "For Him",
    tagline: "Bold / Classic / Timeless",
    blurb: "Roasted coffee, leather and dark amber.",
    description:
      "A deep, dark fragrance built around freshly roasted coffee, warmed by leather and softened with tonka bean. Made for evenings that run long.",
    price: 3000,
    image: "/images/cafe-noir.jpg",
    swatch: "#141010",
    bag: "/images/bag-black.png",
    bagLabel: "Black MIJAB bag",
    bottle: "Black glass with blue accents",
    notes: { top: "Bergamot, Cardamom", heart: "Roasted Coffee, Leather", base: "Tonka Bean, Dark Amber" },
  },
  "vanilla-gourmand": {
    id: "vanilla-gourmand",
    slug: "vanilla-gourmand",
    name: "Vanilla Gourmand",
    audience: "For Her",
    tagline: "Soft / Elegant / Unforgettable",
    blurb: "Vanilla orchid, praline and sandalwood.",
    description:
      "A warm, indulgent fragrance of vanilla orchid and praline, lifted by pear and a touch of pink pepper. Soft, lingering and unforgettable.",
    price: 3000,
    image: "/images/vanilla-gourmand.jpg",
    swatch: "#DCCBE6",
    bag: "/images/bag-pink.png",
    bagLabel: "Pink MIJAB bag",
    bottle: "Black glass with purple accents",
    notes: { top: "Pear, Pink Pepper", heart: "Vanilla Orchid, Praline", base: "Tonka Bean, Sandalwood" },
  },
  duo: {
    id: "duo",
    slug: "duo",
    name: "The Duo",
    audience: "Both fragrances",
    tagline: "Two fragrances. One story.",
    blurb: "Café Noir and Vanilla Gourmand, together.",
    description: "Gift him, gift her, or keep both. The pair arrives together in a signature MIJAB bag.",
    price: 5500,
    compareAt: 6000,
    image: "/images/duo.jpg",
    swatch: "#141010",
  },
  "perfume-wax": {
    id: "perfume-wax",
    slug: "perfume-wax",
    name: "Perfume Wax",
    audience: "For Him & Her",
    tagline: "Pure / Gentle / Alcohol-Free",
    blurb: "A solid perfume balm, gift-boxed with a blessing.",
    description:
      "MIJAB Perfume Wax is a solid perfume: a smooth, alcohol-free balm you warm on your fingertip and press onto your wrists, neck and behind the ears. Gentle on skin, easy to carry, and presented in a black windowed gift bag that carries the words “Apply perfume, for it pleases Allah.” (Sunan Abu Dawood).",
    price: 1200,
    image: "/images/wax/perfume-wax.jpg",
    swatch: "#EADBD3",
    bagLabel: "Black windowed MIJAB gift bag",
  },
};

/** True for the solid Perfume Wax, which has no bottle, size in ml or scent notes. */
export const isWax = (p: { id: string }) => p.id === "perfume-wax";

/** Short format line shown under a product name, e.g. "Eau de Parfum · 50 ml". */
export function formatLine(p: { id: string }): string {
  if (p.id === "duo") return "Gift Set · 2 × 50 ml";
  if (isWax(p)) return "Solid Perfume Wax · Gift bag";
  return "Eau de Parfum · 50 ml";
}

/** The product type alone, e.g. "Eau de Parfum" or "Perfume Wax". */
export const formatName = (p: { id: string }) => (isWax(p) ? "Perfume Wax" : p.id === "duo" ? "Gift Set · Eau de Parfum" : "Eau de Parfum");

/** Real scent notes, or null when the product has none (the API returns empty strings). */
export function realNotes(p: { notes?: { top: string; heart: string; base: string } }) {
  const n = p.notes;
  return n && (n.top || n.heart || n.base) ? n : null;
}

export const fragrances = [products["cafe-noir"], products["vanilla-gourmand"]];
export const shopItems = [products["cafe-noir"], products["vanilla-gourmand"], products.duo, products["perfume-wax"]];

export const DELIVERY_FEE = 350;
export const PROMO_CODES: Record<string, number> = { WELCOME10: 0.1, MIJAB10: 0.1 };

export const formatPrice = (n: number) => `Rs. ${n.toLocaleString("en-US")}`;

/** Campaign photography for each product (from the 2026 redesign), used on the
 * homepage and shop cards. Falls back to the product's own catalog image. */
const LOOKS: Record<string, string> = {
  "cafe-noir": "/images/home/card-noir.jpg",
  "vanilla-gourmand": "/images/home/card-vanilla.jpg",
  duo: "/images/home/card-duo.jpg",
  "perfume-wax": "/images/wax/perfume-wax.jpg",
};
export const lookImage = (p: { id: string; image: string }) => LOOKS[p.id] ?? p.image;

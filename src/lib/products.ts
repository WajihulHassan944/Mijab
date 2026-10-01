export type ProductId = "cafe-noir" | "vanilla-gourmand" | "duo";

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
    price: 2500,
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
    price: 2500,
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
    price: 4500,
    compareAt: 5000,
    image: "/images/duo.jpg",
    swatch: "#141010",
  },
};

export const fragrances = [products["cafe-noir"], products["vanilla-gourmand"]];
export const shopItems = [products["cafe-noir"], products["vanilla-gourmand"], products.duo];

export const DELIVERY_FEE = 200;
export const PROMO_CODES: Record<string, number> = { WELCOME10: 0.1, MIJAB10: 0.1 };

export const formatPrice = (n: number) => `Rs. ${n.toLocaleString("en-US")}`;

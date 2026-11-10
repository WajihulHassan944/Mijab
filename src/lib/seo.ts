// Product structured data for Google (Product snippets + Merchant listings).
// One builder so the homepage, product pages and the Duo page stay in step.
import type { ApiReview, PublicSettings } from "./api";
import type { Product } from "./products";
import { SITE_URL } from "./site";

export type RatingSummary = Record<string, { count: number; average: number }>;

/** Everything a product's offer needs beyond the product itself. Fetched once per page. */
export type OfferContext = { deliveryFee: number | null; ratings: RatingSummary };

const productUrl = (p: Product) => `${SITE_URL}/product/${p.slug}`;

export function offerJsonLd(p: Product, ctx: OfferContext) {
  return {
    "@type": "Offer",
    url: productUrl(p),
    priceCurrency: "PKR",
    price: p.price,
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@type": "Organization", name: "MIJAB" },
    ...(ctx.deliveryFee !== null && {
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: ctx.deliveryFee, currency: "PKR" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "PK" },
        // Delivered in 2–4 working days in total: up to a day to dispatch, then 2–3 days in transit.
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 3, unitCode: "DAY" },
        },
      },
    }),
    // Perfume is a hygiene product: MIJAB does not accept returns (store policy, see the FAQ).
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "PK",
      returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
    },
  };
}

/** Product node. Ratings and reviews are only included when real, approved
 * reviews exist, and `reviews` must be ones the page actually shows. */
export function productJsonLd(p: Product, ctx: OfferContext, opts: { name?: string; images?: string[]; reviews?: ApiReview[] } = {}) {
  const rating = ctx.ratings[p.name];
  return {
    "@type": "Product",
    name: opts.name ?? `MIJAB ${p.name}`,
    image: (opts.images ?? [p.image]).map((src) => `${SITE_URL}${src}`),
    description: p.description || p.blurb,
    sku: p.slug,
    category: "Health & Beauty > Personal Care > Cosmetics > Perfume & Cologne",
    brand: { "@type": "Brand", name: "MIJAB" },
    offers: offerJsonLd(p, ctx),
    ...(rating && rating.count > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: rating.average, reviewCount: rating.count, bestRating: 5, worstRating: 1 },
    }),
    ...(opts.reviews && opts.reviews.length > 0 && {
      review: opts.reviews.map((r) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.name },
        datePublished: r.createdAt.slice(0, 10),
        reviewBody: r.body,
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
      })),
    }),
  };
}

/** Delivery fee and ratings for structured data; each part degrades to "omit" if the API is down. */
export async function fetchOfferContext(api: {
  settings: { get: () => Promise<PublicSettings> };
  reviews: { summary: () => Promise<RatingSummary> };
}): Promise<OfferContext> {
  const [settings, ratings] = await Promise.all([api.settings.get().catch(() => null), api.reviews.summary().catch((): RatingSummary => ({}))]);
  return { deliveryFee: settings ? settings.deliveryFee : null, ratings };
}

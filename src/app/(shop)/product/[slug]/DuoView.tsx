import type { Metadata } from "next";
import Link from "next/link";
import { ProductMedia } from "@/components/Media";
import { Arrow } from "@/components/Icons";
import { formatPrice, Product } from "@/lib/products";
import type { Catalog } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";
import { PurchasePanel } from "./PurchasePanel";

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

function Notes({ p }: { p?: Product }) {
  if (!p?.notes) return null;
  return (
    <div>
      <div className="eyebrow hd">{p.name} · {p.audience}</div>
      <div className="note"><span className="k">Top</span><span className="v">{p.notes.top}</span></div>
      <div className="note"><span className="k">Heart</span><span className="v">{p.notes.heart}</span></div>
      <div className="note"><span className="k">Base</span><span className="v">{p.notes.base}</span></div>
    </div>
  );
}

export function DuoView({ catalog }: { catalog: Catalog }) {
  const duo = catalog.duo;
  const noir = catalog["cafe-noir"];
  const vanilla = catalog["vanilla-gourmand"];
  const url = `${SITE_URL}/product/duo`;

  const gallery = [
    { id: "duo", src: duo.image, alt: "MIJAB Café Noir and Vanilla Gourmand together" },
    ...(noir ? [{ id: "noir", src: noir.image, alt: `MIJAB ${noir.name}`, bg: noir.swatch }] : []),
    ...(vanilla ? [{ id: "vanilla", src: vanilla.image, alt: `MIJAB ${vanilla.name}`, bg: vanilla.swatch }] : []),
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "MIJAB The Duo Gift Set",
      image: [`${SITE_URL}${duo.image}`],
      description: duo.description,
      sku: "duo",
      category: "Health & Beauty > Personal Care > Cosmetics > Perfume & Cologne",
      brand: { "@type": "Brand", name: "MIJAB" },
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "PKR",
        price: duo.price,
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: "MIJAB" },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
        { "@type": "ListItem", position: 3, name: duo.name, item: url },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="wrap">
        <div className="pcrumbs"><Link href="/">Home</Link> &nbsp;/&nbsp; <Link href="/shop">Shop</Link> &nbsp;/&nbsp; <span>{duo.name}</span></div>
        <PurchasePanel product={duo} gallery={gallery} eyebrow="Gift Set · Eau de Parfum" size="2 × 50 ml" />

        <section className="pdp-details">
          <Notes p={noir} />
          <Notes p={vanilla} />
          <div>
            <div className="eyebrow hd">In the set</div>
            <div className="li">{noir?.name ?? "Café Noir"}, 50 ml eau de parfum</div>
            <div className="li">{vanilla?.name ?? "Vanilla Gourmand"}, 50 ml eau de parfum</div>
            <div className="li">Signature MIJAB gift bag</div>
            <div className="li">Delivery cost and options are shown at checkout.</div>
            <div className="li">Questions? Visit the <Link href="/contact" style={{ textDecoration: "underline" }}>contact page</Link>.</div>
          </div>
        </section>
      </div>

      <section className="more">
        <div className="wrap">
          <div className="eyebrow">Prefer just one?</div>
          <h2>Shop each fragrance</h2>
          <div className="more-grid">
            {[noir, vanilla].filter(Boolean).map((p) => (
              <Link key={p.slug} href={`/product/${p.slug}`} className="more-card">
                <ProductMedia product={p} sizes="140px" />
                <div className="c">
                  <div className="eyebrow">{p.audience}</div>
                  <div className="n">{p.name}</div>
                  <div className="p">{formatPrice(p.price)}</div>
                  <div className="link-arrow">View <Arrow stroke="#9B6B66" w={12} /></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

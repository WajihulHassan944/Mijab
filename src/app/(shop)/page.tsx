import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arrow, Cash, Clock, Gift, Leaf, ShieldCheck, Star, Truck, BagIcon } from "@/components/Icons";
import { AddToBag } from "@/components/Buttons";
import { HeroFilm } from "@/components/lux/HeroFilm";
import { formatPrice, lookImage, Product } from "@/lib/products";
import { fetchCatalog } from "@/lib/catalog";
import { api, ApiReview } from "@/lib/api";
import { fetchOfferContext, productJsonLd } from "@/lib/seo";

export const revalidate = 0; // always fetch the live catalog — never a stale build-time snapshot

const HOME_DESCRIPTION =
  "Discover MIJAB: Café Noir for him, Vanilla Gourmand for her, The Duo gift set and the new alcohol-free Perfume Wax. Delivered across Pakistan in 2–4 working days, cash on delivery available.";

export const metadata: Metadata = {
  title: { absolute: "MIJAB — Fragrances that Stay with You" },
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "MIJAB",
    title: "MIJAB — Fragrances that Stay with You",
    description: HOME_DESCRIPTION,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "MIJAB — Café Noir and Vanilla Gourmand" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MIJAB — Fragrances that Stay with You",
    description: HOME_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
};

/** Small line under each card name: who it's for, or what's inside. */
function cardMeta(p: Product) {
  if (p.id === "duo") return <span className="lx-card-sub">Café Noir + Vanilla Gourmand</span>;
  if (p.id === "perfume-wax") return <span className="lx-card-sub">Alcohol-free solid perfume</span>;
  return (
    <>
      <span className="lx-tag">{p.audience}</span>
      <span className="lx-card-sub">Eau de Parfum · 50 ml</span>
    </>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="lx-stars" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => <Star key={i} color={i < n ? "#B8894D" : "#e3d3c4"} />)}
    </span>
  );
}

export default async function Home() {
  const [catalog, reviews, offerCtx, settings] = await Promise.all([
    fetchCatalog(),
    api.reviews.list(6).catch((): ApiReview[] => []),
    fetchOfferContext(api),
    api.settings.get().catch(() => null),
  ]);
  const order = ["cafe-noir", "vanilla-gourmand", "duo", "perfume-wax"];
  const items = order.map((id) => catalog[id]).filter(Boolean);
  const wax = catalog["perfume-wax"];
  const cod = settings?.cod ?? true;
  const shownReviews = reviews.filter((r) => r.body.trim()).slice(0, 3);

  const productsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      // No ratings here: the homepage shows no per-product stars, and Google requires marked-up ratings to be visible.
      item: productJsonLd(p, { ...offerCtx, ratings: {} }),
    })),
  };

  return (
    <div className="lx">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productsJsonLd) }} />

      {/* ---------- announcement ---------- */}
      <div className="lx-announce">
        <span><Truck size={16} stroke="currentColor" width={1.4} /> <span className="lx-hide-m">Delivered in 2–4 working days across Pakistan</span><span className="lx-only-m">2–4 day delivery across Pakistan</span></span>
        {cod && <span className="lx-hide-m">Cash on delivery available</span>}
        <span className="lx-hide-m">Secure checkout</span>
      </div>

      {/* ---------- hero film ---------- */}
      <section className="lx-hero" aria-labelledby="lx-hero-title">
        <HeroFilm />
        <div className="lx-hero-shade" />
        <div className="lx-hero-copy">
          <div className="lx-eyebrow">MIJAB Eau de Parfum</div>
          <h1 id="lx-hero-title">Fragrances <br className="lx-hide-m" />that <em>Stay with You</em></h1>
          <p>Refined, long-lasting scents for the moments that matter, delivered to your door across Pakistan.</p>
          <div className="lx-hero-cta">
            <Link href="/shop" className="lx-btn dark">Shop Fragrances <Arrow /></Link>
            <a href="#collection" className="lx-btn ghost">Explore the Collection</a>
          </div>
        </div>
      </section>

      {/* ---------- new: perfume wax ---------- */}
      {wax && (
        <section className="lx-wax" aria-labelledby="lx-wax-title">
          <div className="lx-wrap lx-wax-grid">
            <Link href={`/product/${wax.slug}`} className="lx-wax-img">
              <Image src={lookImage(wax)} alt="MIJAB Perfume Wax in its black windowed gift bag" fill sizes="(max-width: 820px) 100vw, 520px" />
            </Link>
            <div className="lx-wax-copy">
              <div className="lx-eyebrow gold lined">New Launch</div>
              <h2 id="lx-wax-title">Mijab <em>Perfume Wax</em></h2>
              <p className="lx-lead">An alcohol-free solid perfume for a soft, close-to-skin scent, anytime, anywhere.</p>
              <ul className="lx-benefits">
                <li><Leaf size={30} stroke="currentColor" width={1.1} /><span>Alcohol-Free<br />&amp; Skin Friendly</span></li>
                <li><Clock size={30} stroke="currentColor" width={1.1} /><span>Long-Lasting<br />Fragrance</span></li>
                <li><BagIcon size={30} stroke="currentColor" width={1.1} /><span>Travel-Friendly<br />&amp; Mess-Free</span></li>
              </ul>
              <div className="lx-wax-buy">
                <span className="lx-price-lg">{formatPrice(wax.price)}</span>
                <AddToBag id={wax.id} className="lx-btn dark wide" label="Add to Bag" icon go={null} />
              </div>
              <Link href={`/product/${wax.slug}`} className="lx-textlink">How to wear it <Arrow /></Link>
            </div>
          </div>
        </section>
      )}

      {/* ---------- the collection ---------- */}
      <section className="lx-collection" id="collection" aria-labelledby="lx-col-title">
        <div className="lx-wrap">
          <header className="lx-head">
            <div className="lx-eyebrow gold lined both">The Collection</div>
            <h2 id="lx-col-title">Our Fragrances</h2>
            <p>Fine fragrances for him, for her, or together, made by MIJAB.</p>
          </header>
          <div className="lx-cards">
            {items.map((p) => {
              const save = p.compareAt && p.compareAt > p.price ? p.compareAt - p.price : 0;
              return (
                <article className="lx-card" key={p.id}>
                  <Link href={`/product/${p.slug}`} className="lx-card-img">
                    <Image src={lookImage(p)} alt={`MIJAB ${p.name}`} fill sizes="(max-width: 820px) 46vw, 270px" />
                  </Link>
                  <div className="lx-card-body">
                    <div className="lx-card-name">
                      <Link href={`/product/${p.slug}`}>{p.name}</Link>
                      {p.id === "perfume-wax" && <span className="lx-new">New</span>}
                    </div>
                    <div className="lx-card-meta">{cardMeta(p)}</div>
                    <div className="lx-card-price">
                      <span>{formatPrice(p.price)}</span>
                      {save > 0 && <s>{formatPrice(p.compareAt!)}</s>}
                      {save > 0 && <span className="lx-save">Save {formatPrice(save)}</span>}
                    </div>
                    <AddToBag id={p.id} className="lx-btn dark sm" label="Add to Bag" icon go={null} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- our story ---------- */}
      <section className="lx-story" aria-labelledby="lx-story-title">
        <Image className="lx-story-img" src="/images/home/story.jpg" alt="Close-up of a MIJAB bottle with its gold monogram" fill sizes="100vw" />
        <div className="lx-story-copy">
          <div className="lx-eyebrow">Our Story</div>
          <h2 id="lx-story-title"><em>The Essence of</em> MIJAB</h2>
          <p>A Pakistani fragrance house creating refined, long-lasting scents that blend modern elegance with timeless character.</p>
          <Link href="/about" className="lx-btn ghost sm">Discover Our Story <Arrow /></Link>
        </div>
      </section>

      {/* ---------- reviews (admin-approved only) ---------- */}
      {shownReviews.length > 0 && (
        <section className="lx-reviews" id="reviews" aria-labelledby="lx-rev-title">
          <div className="lx-wrap lx-reviews-grid">
            <div className="lx-reviews-head">
              <div className="lx-eyebrow">Customer Reviews</div>
              <h2 id="lx-rev-title"><em>Loved by</em> Fragrance <em>Enthusiasts</em></h2>
            </div>
            <div className="lx-quotes">
              {shownReviews.map((r) => (
                <figure className="lx-quote" key={r.id}>
                  <Stars n={Math.round(r.rating)} />
                  <blockquote>&ldquo;{r.body.length > 140 ? `${r.body.slice(0, 137).trimEnd()}…` : r.body}&rdquo;</blockquote>
                  <figcaption>— {r.name}{r.city ? `, ${r.city}` : ""}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- trust row ---------- */}
      <section className="lx-trust" aria-label="Why shop with MIJAB">
        <div className="lx-wrap lx-trust-row">
          {cod && <div><Cash size={30} stroke="currentColor" width={1.1} /><span>Cash on<br className="lx-only-m" /> Delivery</span></div>}
          <div><Truck size={30} stroke="currentColor" width={1.1} /><span>Delivered in 2–4 Working Days<span className="lx-hide-m"><br />Across Pakistan</span></span></div>
          <div><Gift size={30} stroke="currentColor" width={1.1} /><span>Gift-Ready<br /> Packaging</span></div>
          <div><ShieldCheck size={30} stroke="currentColor" width={1.1} /><span>Secure<br /> Checkout</span></div>
        </div>
      </section>
    </div>
  );
}

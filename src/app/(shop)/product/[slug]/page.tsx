import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToBag } from "@/components/Buttons";
import { BagIcon, Cash, Clock, Gift, Leaf, Star, Truck } from "@/components/Icons";
import { formatPrice, isWax, lookImage, Product, realNotes } from "@/lib/products";
import { fetchCatalog } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";
import { api, ApiReview } from "@/lib/api";
import { fetchOfferContext, productJsonLd } from "@/lib/seo";
import { duoMetadata } from "./duoMetadata";
import { LxBuy, LxGallery, Shot } from "./LxPurchase";
import "./product.css";

export const revalidate = 0; // always the live catalog, never a stale build-time snapshot

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await fetchCatalog();
  if (slug === "duo" && catalog.duo) return duoMetadata(catalog.duo);
  const p = catalog[slug];
  if (!p) return { title: "Product", robots: { index: false } };
  const wax = isWax(p);
  const title = wax ? `MIJAB ${p.name}: Alcohol-Free Solid Perfume` : `${p.name} Eau de Parfum ${p.audience}`;
  const description = wax
    ? `MIJAB Perfume Wax, an alcohol-free solid perfume in a gift bag, for ${formatPrice(p.price)}. ${p.blurb} Delivery across Pakistan, cash on delivery available.`
    : `${p.name} by MIJAB, eau de parfum ${p.audience.toLowerCase()}. ${p.blurb} 50 ml for ${formatPrice(p.price)}. Delivery across Pakistan, cash on delivery available.`;
  const url = `/product/${p.slug}`;
  const images = [{ url: p.image, alt: wax ? "MIJAB Perfume Wax gift bag" : `MIJAB ${p.name} eau de parfum` }];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, siteName: "MIJAB", title: `${title} · MIJAB`, description, images },
    twitter: { card: "summary_large_image", title: `${title} · MIJAB`, description, images: [p.image] },
  };
}

/** Gallery for each product: the campaign photograph first, then scenes and the catalog photo. */
function shotsFor(p: Product): Shot[] {
  const look = { id: "look", src: lookImage(p), alt: `MIJAB ${p.name}` };
  const own = p.image && p.image !== look.src ? [{ id: "own", src: p.image, alt: `MIJAB ${p.name} product photo` }] : [];
  switch (p.id) {
    case "cafe-noir":
      return [look, { id: "scene", src: "/images/home/frame2.jpg", alt: "Café Noir beside its gift bag", pos: "74% 50%" }, ...own, { id: "bag", src: "/images/bag-black.png", alt: "Black-bow MIJAB gift bag", contain: true }];
    case "vanilla-gourmand":
      return [look, { id: "scene", src: "/images/home/frame3.jpg", alt: "Vanilla Gourmand beside its gift bag", pos: "76% 50%" }, ...own, { id: "bag", src: "/images/bag-pink.png", alt: "Pink-bow MIJAB gift bag", contain: true }];
    case "duo":
      return [look, { id: "scene", src: "/images/home/frame1.jpg", alt: "The full MIJAB collection", pos: "64% 50%" }, ...own];
    case "perfume-wax":
      return [
        look,
        { id: "pink", src: "/images/wax/wax-pink.jpg", alt: "MIJAB Perfume Wax on a cushion" },
        { id: "real", src: "/images/wax/wax-real.jpg", alt: "MIJAB Perfume Wax beside a plant" },
        { id: "gifts", src: "/images/wax/wax-gifts.jpg", alt: "MIJAB Perfume Wax gift bags with petals" },
        { id: "close", src: "/images/wax/wax-closeup.jpg", alt: "Close-up of the MIJAB Perfume Wax card" },
      ];
    default:
      return [look, ...own];
  }
}

const PYRAMID: Record<string, string> = { "cafe-noir": "/images/pdp/pyramid-noir.jpg", "vanilla-gourmand": "/images/pdp/pyramid-vanilla.jpg" };

function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span className="lp-stars" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={size} color={i <= Math.round(value) ? "#B8894D" : "#e5d5c7"} />)}
    </span>
  );
}

function NotesPyramid({ p, title = "Scent Notes" }: { p: Product; title?: string }) {
  const n = realNotes(p);
  if (!n) return null;
  const img = PYRAMID[p.id];
  return (
    <div className="lp-notes">
      <div className="lx-eyebrow gold lp-notes-title">{title}</div>
      <div className={`lp-pyramid${img ? "" : " plain"}`}>
        {img && <Image src={img} alt="" width={300} height={312} className="lp-pyr-img" />}
        <dl>
          <div><dt>Top Notes</dt><dd>{n.top}</dd></div>
          <div><dt>Heart Notes</dt><dd>{n.heart}</dd></div>
          <div><dt>Base Notes</dt><dd>{n.base}</dd></div>
        </dl>
      </div>
    </div>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await fetchCatalog();
  const product = catalog[slug];
  if (!product) notFound();
  const wax = isWax(product);
  const duo = product.id === "duo";
  const [ctx, reviews, settings] = await Promise.all([
    fetchOfferContext(api),
    api.reviews.list(24, product.name).catch((): ApiReview[] => []),
    api.settings.get().catch(() => null),
  ]);
  const cod = settings?.cod ?? true;
  const summary = ctx.ratings[product.name];
  const noir = catalog["cafe-noir"];
  const vanilla = catalog["vanilla-gourmand"];
  const others = ["cafe-noir", "vanilla-gourmand", "duo", "perfume-wax"].filter((id) => id !== product.id).map((id) => catalog[id]).filter(Boolean);
  const save = product.compareAt && product.compareAt > product.price ? product.compareAt - product.price : 0;
  const size = wax ? "Solid wax" : duo ? "2 × 50 ml" : "50 ml";
  const kind = wax ? "Solid Perfume" : duo ? "Gift Set · Eau de Parfum" : "Eau de Parfum";
  const hasNotes = !!realNotes(product);

  const url = `${SITE_URL}/product/${product.slug}`;
  const jsonLd = [
    { "@context": "https://schema.org", ...productJsonLd(product, ctx, { reviews, ...(duo ? { name: "MIJAB The Duo Gift Set" } : {}) }) },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
        { "@type": "ListItem", position: 3, name: product.name, item: url },
      ],
    },
  ];

  return (
    <div className="lx lp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="lx-wrap">
        <nav className="lp-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden>›</span><Link href="/shop">Fragrances</Link><span aria-hidden>›</span><b>{product.name}</b>
        </nav>

        <section className={`lp-top${hasNotes || wax ? "" : " no-notes"}`}>
          <LxGallery shots={shotsFor(product)} />

          <div className="lp-info">
            <h1>{product.name}</h1>
            <div className="lp-kind">
              {!duo && <span className="lx-tag">{product.audience}</span>}
              <span>{kind}</span>
              {!wax && !duo && <><span aria-hidden>·</span><span>{size}</span></>}
              {wax && <span className="lx-new">New</span>}
            </div>
            <div className="lp-tagline">{product.tagline}</div>
            {summary && summary.count > 0 && (
              <a href="#reviews" className="lp-rating">
                <Stars value={summary.average} />
                <span>({summary.count} {summary.count === 1 ? "Review" : "Reviews"})</span>
              </a>
            )}
            <div className="lp-price">
              {formatPrice(product.price)}
              {save > 0 && <s>{formatPrice(product.compareAt!)}</s>}
              {save > 0 && <span className="lx-save">Save {formatPrice(save)}</span>}
            </div>
            <p className="lp-desc">{product.description}</p>
            <div className="lp-size"><span>Size:</span><span className="lp-chip">{size}</span></div>
            <LxBuy id={product.id} name={product.name} />
            <ul className="lp-assure">
              {cod && <li><Cash size={26} stroke="currentColor" width={1.1} /><span>Cash on<br />Delivery</span></li>}
              <li><Truck size={26} stroke="currentColor" width={1.1} /><span>Delivered in<br />2–4 Working Days</span></li>
              <li><Gift size={26} stroke="currentColor" width={1.1} /><span>Gift Bag<br />Included</span></li>
            </ul>
          </div>

          {hasNotes ? (
            <NotesPyramid p={product} />
          ) : wax ? (
            <div className="lp-notes lp-howto">
              <div className="lx-eyebrow gold lp-notes-title">How to Wear</div>
              <ol>
                <li><Leaf size={26} stroke="currentColor" width={1.1} /><span><b>Warm</b>Touch the wax lightly with a fingertip.</span></li>
                <li><Clock size={26} stroke="currentColor" width={1.1} /><span><b>Press</b>Apply to wrists, neck and behind the ears.</span></li>
                <li><BagIcon size={26} stroke="currentColor" width={1.1} /><span><b>Carry</b>Mess-free in your bag; top up through the day.</span></li>
              </ol>
            </div>
          ) : null}
        </section>

        {duo && (noir || vanilla) && (
          <section className="lp-duo-notes">
            {noir && <NotesPyramid p={noir} title={`${noir.name} · ${noir.audience}`} />}
            {vanilla && <NotesPyramid p={vanilla} title={`${vanilla.name} · ${vanilla.audience}`} />}
          </section>
        )}

        <section className={`lp-lower${reviews.length ? "" : " solo"}`}>
          <div className="lp-acc">
            <h2>Details &amp; Delivery</h2>
            <details open>
              <summary><span>Product Details</span></summary>
              <ul>
                {duo ? (
                  <>
                    <li>{noir?.name ?? "Café Noir"}, 50 ml eau de parfum, for him</li>
                    <li>{vanilla?.name ?? "Vanilla Gourmand"}, 50 ml eau de parfum, for her</li>
                    <li>Arrives together in a signature MIJAB gift bag</li>
                  </>
                ) : wax ? (
                  <>
                    <li>Solid perfume · alcohol-free</li>
                    <li>{product.audience}</li>
                    <li>Comes in: {product.bagLabel ?? "Black windowed MIJAB gift bag"}</li>
                  </>
                ) : (
                  <>
                    <li>Eau de Parfum · 50 ml · {product.audience}</li>
                    {product.bottle && <li>Bottle: {product.bottle}</li>}
                    {product.bagLabel && <li>Comes in: {product.bagLabel}</li>}
                  </>
                )}
              </ul>
            </details>
            <details>
              <summary><span>Delivery &amp; Returns</span></summary>
              <ul>
                <li>Delivered in 2–4 working days across Pakistan.</li>
                <li>Delivery cost and options are shown at checkout{cod ? "; cash on delivery is available" : ""}.</li>
                <li>For hygiene reasons, perfume can&apos;t be returned once opened.</li>
                <li>Questions? <Link href="/contact">Contact us</Link> and we&apos;ll help.</li>
              </ul>
            </details>
            <details>
              <summary><span>Authenticity</span></summary>
              <ul>
                <li>Ordered on mijab.shop, your MIJAB comes straight from us, sealed and gift-ready.</li>
                <li>Follow every order on the <Link href="/track">order tracking page</Link>.</li>
              </ul>
            </details>
          </div>

          {reviews.length > 0 && (
            <div className="lp-reviews" id="reviews">
              <div className="lp-reviews-head">
                <h2>Customer Reviews</h2>
                {summary && summary.count > 0 && (
                  <span className="lp-score"><b>{summary.average.toFixed(1)}</b><Stars value={summary.average} size={13} />{summary.count} {summary.count === 1 ? "review" : "reviews"}</span>
                )}
              </div>
              <div className="lp-rev-list">
                {reviews.slice(0, 6).map((r) => (
                  <figure className="lp-rev" key={r.id}>
                    <Stars value={r.rating} size={15} />
                    <blockquote>&ldquo;{r.body}&rdquo;</blockquote>
                    <figcaption>— {r.name}{r.city ? `, ${r.city}` : ""}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="lp-more" aria-labelledby="lp-more-title">
          <h2 className="lx-eyebrow gold lined both" id="lp-more-title">You May Also Like</h2>
          <div className="lp-more-grid">
            {others.map((o) => {
              const oSave = o.compareAt && o.compareAt > o.price;
              return (
                <article className="lp-mcard" key={o.id}>
                  <Link href={`/product/${o.slug}`} className="lp-mcard-img"><Image src={lookImage(o)} alt={`MIJAB ${o.name}`} fill sizes="(max-width: 820px) 40vw, 190px" /></Link>
                  <div className="lp-mcard-body">
                    <Link href={`/product/${o.slug}`} className="lp-mcard-name">{o.name}</Link>
                    {o.id === "duo" ? <span className="lx-card-sub">Café Noir + Vanilla Gourmand</span> : o.id === "perfume-wax" ? <span className="lx-new">New</span> : <span className="lx-tag">{o.audience}</span>}
                    <div className="lp-mcard-price">{formatPrice(o.price)}{oSave && <s>{formatPrice(o.compareAt!)}</s>}</div>
                    <AddToBag id={o.id} className="lx-btn dark sm" label="Add to Bag" icon go={null} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

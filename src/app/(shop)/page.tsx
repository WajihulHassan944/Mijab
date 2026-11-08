import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ProductMedia } from "@/components/Media";
import { Arrow, ChevronRight, Headset, ShieldCheck, Sparkle, Truck } from "@/components/Icons";
import { AddToBag } from "@/components/Buttons";
import { MobileHero, Newsletter } from "@/components/HomeMobile";
import { MobileTestimonials, Testimonials } from "@/components/Testimonials";
import { formatPrice } from "@/lib/products";
import { fetchCatalog } from "@/lib/catalog";
import { api, ApiReview } from "@/lib/api";

export const revalidate = 0; // always fetch the live catalog — never a stale build-time snapshot

const HOME_DESCRIPTION =
  "Discover MIJAB — Café Noir for him and Vanilla Gourmand for her. Premium eau de parfum, free delivery across Pakistan, cash on delivery available.";

export const metadata: Metadata = {
  title: { absolute: "MIJAB — Scent / Elegance / You" },
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "MIJAB",
    title: "MIJAB — Scent / Elegance / You",
    description: HOME_DESCRIPTION,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "MIJAB — Café Noir and Vanilla Gourmand" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MIJAB — Scent / Elegance / You",
    description: HOME_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
};

export default async function Home() {
  const [catalog, reviews] = await Promise.all([fetchCatalog(), api.reviews.list(6).catch((): ApiReview[] => [])]);
  const noir = catalog["cafe-noir"];
  const vanilla = catalog["vanilla-gourmand"];
  const duo = catalog.duo;
  const fragrances = [noir, vanilla].filter(Boolean);

  const productsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [noir, vanilla, duo].filter(Boolean).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: `MIJAB ${p.name}`,
        image: `https://mijab.shop${p.image}`,
        description: p.blurb || p.tagline,
        brand: { "@type": "Brand", name: "MIJAB" },
        offers: {
          "@type": "Offer",
          url: `https://mijab.shop/product/${p.slug}`,
          priceCurrency: "PKR",
          price: p.price,
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productsJsonLd) }} />
      {/* ---------- mobile: announcement ---------- */}
      <Link href="/shop" className="mh-announce only-mobile">
        <Sparkle size={13} color="#e9b2a6" />
        <span>Free Delivery Across Pakistan</span>
        <ChevronRight size={14} stroke="#f6eae2" width={1.6} />
      </Link>

      {/* ---------- hero ---------- */}
      <section className="hero only-desktop">
        <Image className="bg" src="/images/hero.jpg" alt="" fill priority sizes="100vw" />
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow">Exclusive Fragrances</div>
            <h1>More Than Just a Scent</h1>
            <div className="it">It&apos;s a feeling. It&apos;s you.</div>
            <p>
              Discover MIJAB — two unique fragrances,
              <br />one timeless essence. Crafted for the moments
              <br />that matter.
            </p>
            <a className="btn-blush" href="#collection">Explore the Collection <Arrow stroke="#2A1D18" /></a>
          </div>
          <div className="hero-bags">
            <Image src="/images/bag-pink.png" alt="MIJAB bag with pink bow" width={270} height={425} priority />
            <Image src="/images/bag-black.png" alt="MIJAB bag with black bow" width={280} height={430} priority />
          </div>
        </div>
      </section>
      <MobileHero duoImage={duo.image} />

      {/* ---------- mobile: collection ---------- */}
      <section className="mh-collection only-mobile" aria-labelledby="mh-col-title">
        <div className="mh-eyebrow"><span>Our Collection</span></div>
        <h2 className="mh-title" id="mh-col-title">Timeless Fragrances</h2>
        <p className="mh-lead">Discover our signature scents crafted<br />for every mood and moment.</p>
        <div className="mh-cards">
          {[noir, vanilla, duo].filter(Boolean).map((p, i) => (
            <Link href={`/product/${p.slug}`} className="mh-card" key={p.id}>
              <ProductMedia product={p} sizes="34vw" />
              {i === 0 && <span className="mh-badge">Bestseller</span>}
              <span className="mh-card-name">{p.name}</span>
              <span className="mh-card-price">{formatPrice(p.price)}</span>
            </Link>
          ))}
        </div>
        <Link href="/shop" className="mh-pill dark">View All Fragrances <Arrow stroke="#F6EAE2" w={13} /></Link>
      </section>

      {/* ---------- mobile: trust strip ---------- */}
      <section className="mh-trust only-mobile" aria-label="Why shop with MIJAB">
        <div><Truck size={26} width={1.4} /><b>Free Delivery</b><span>Across Pakistan</span></div>
        <div><ShieldCheck size={26} width={1.4} /><b>Secure Checkout</b><span>Shop with Confidence</span></div>
        <div><Headset size={26} width={1.4} /><b>Friendly Support</b><span>We&apos;re Here to Help</span></div>
      </section>

      {/* ---------- mobile: about band ---------- */}
      <section className="mh-about only-mobile" aria-labelledby="mh-about-title">
        <Image className="mh-about-bg" src="/images/m-home/elegance.jpg" alt="A man spraying MIJAB eau de parfum" fill sizes="100vw" />
        <div className="mh-about-copy">
          <div className="mh-about-eyebrow">About MIJAB</div>
          <h2 id="mh-about-title">Elegance in Every Spray</h2>
          <p>Experience luxury like never before.</p>
          <Link href="/about" className="mh-pill ghost">Learn More <Arrow stroke="#F6EAE2" w={13} /></Link>
        </div>
      </section>

      {/* ---------- mobile: reviews + newsletter ---------- */}
      <MobileTestimonials reviews={reviews} />
      <Newsletter />

      {/* ---------- collection ---------- */}
      <section className="collection only-desktop" id="collection">
        <div className="wrap">
          <div className="intro">
            <div className="eyebrow">The MIJAB Collection</div>
            <h2>Two Fragrances. One Identity.</h2>
            <div className="rule" />
            <p>Two distinct expressions, designed for him and her. Each fragrance tells a story — of confidence, elegance and individuality.</p>
            <Link href="/shop" className="link-arrow">Meet the Collection <Arrow stroke="#9B6B66" w={12} /></Link>
          </div>
          <div className="col-cards">
            {fragrances.map((p) => (
              <div className="col-card" key={p.id}>
                <Link href={`/product/${p.slug}`}>
                  <ProductMedia product={p} sizes="(max-width: 820px) 80vw, 300px" />
                </Link>
                <div className="cap">
                  <b>{p.audience}</b>
                  <span>{p.tagline.replace(/ \/ /g, "  /  ")}</span>
                </div>
                <div className="name-row">
                  <Link href={`/product/${p.slug}`} className="n">{p.name}</Link>
                  <span className="p">{formatPrice(p.price)}</span>
                </div>
                <div className="sub">Eau de Parfum · 50 ml</div>
                {p.notes && (
                  <div className="scent-line">
                    <span className="k">Scent Notes</span>
                    <span className="v">{[p.notes.top, p.notes.heart, p.notes.base].join(" · ")}</span>
                  </div>
                )}
                <AddToBag id={p.id} className={`btn ${p.id === "cafe-noir" ? "dark-btn" : "lilac-btn"}`} arrow go={null} label="Add to bag" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- duo ---------- */}
      <section className="duo-band only-desktop">
        <div className="wrap">
          <div className="duo-img">
            <ProductMedia product={duo} sizes="400px" />
            {duo.compareAt && <span className="save-badge">Save<br />{formatPrice(duo.compareAt - duo.price)}</span>}
          </div>
          <div className="duo-copy">
            <div className="eyebrow">The Duo</div>
            <h2>Two Fragrances. One Story.</h2>
            <p>Gift him, gift her, or keep both. The pair arrives together in a signature MIJAB bag.</p>
            <div className="duo-buy">
              <span className="price">{formatPrice(duo.price)}</span>
              <span className="strike">{formatPrice(duo.compareAt!)}</span>
              <AddToBag id="duo" className="btn-outline fit" label="Add the pair" arrow go={null} />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- story ---------- */}
      <section className="split story only-desktop" id="story">
        <Image src="/images/petal.jpg" alt="Soft pink petal with the MIJAB monogram" fill sizes="100vw" />
        <div className="wrap">
          <div className="copy">
            <div className="eyebrow">Our Story</div>
            <h2>The Essence of MIJAB</h2>
            <div className="rule" />
            <p>
              MIJAB is a celebration of individuality, elegance and the little moments that make life beautiful. We believe a fragrance isn&apos;t just worn — it&apos;s felt. It becomes a part of your story.
            </p>
            <Link href="/about" className="link-arrow">Learn More <Arrow stroke="#9B6B66" w={12} /></Link>
          </div>
        </div>
      </section>

      {/* ---------- experience ---------- */}
      <section className="split exp only-desktop">
        <Image src="/images/couple.jpg" alt="A couple sharing a close, quiet moment" fill sizes="100vw" />
        <div className="wrap">
          <div className="copy">
            <div className="eyebrow">The MIJAB Experience</div>
            <h2>Elegance in Every Moment</h2>
            <p>Because the right fragrance doesn&apos;t just complement your presence — it leaves a mark.</p>
            <Link href="/shop" className="btn-outline btn-ghost fit">Discover MIJAB <Arrow stroke="#F6EAE2" w={12} /></Link>
          </div>
        </div>
      </section>

      {/* ---------- notes ---------- */}
      <section className="notes only-desktop">
        <div className="wrap">
          <div className="intro">
            <div className="eyebrow">The Scent Notes</div>
            <h2>Two stories, told in notes.</h2>
            <div className="rule" />
            <p>A glimpse into how each fragrance opens, unfolds and lingers on the skin.</p>
          </div>
          {fragrances.map((p) => (
            <div className="note-col" key={p.id}>
              <div className="note-head">
                <div className="disc"><Image src={p.image} alt={`MIJAB fragrance ${p.audience.toLowerCase()}`} fill sizes="120px" /></div>
                <div><b>{p.audience}</b><i>{p.name}</i></div>
              </div>
              <div className="note-row"><span className="k">Top</span><span className="v">{p.notes!.top}</span></div>
              <div className="note-row"><span className="k">Heart</span><span className="v">{p.notes!.heart}</span></div>
              <div className="note-row"><span className="k">Base</span><span className="v">{p.notes!.base}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- gift ---------- */}
      <section className="gift only-desktop">
        <div className="wrap">
          <div className="eyebrow">The Gift Edition</div>
          <h2>Luxury in Every Detail</h2>
          <p>Every MIJAB arrives in its own signature bag: pink for her, black for him.</p>
        </div>
        <div className="gift-stage">
          <div className="gift-half pink">
            <Image src="/images/bag-pink.png" alt="MIJAB bag with pink bow" width={270} height={425} />
            <span>Pink · For her</span>
          </div>
          <div className="gift-half black">
            <Image src="/images/bag-black.png" alt="MIJAB bag with black bow" width={280} height={430} />
            <span>Black · For him</span>
          </div>
        </div>
      </section>

      {/* ---------- reviews (admin-approved only) ---------- */}
      <Testimonials reviews={reviews} />

      {/* ---------- how to order ---------- */}
      <section className="how only-desktop">
        <div className="wrap">
          <div className="eyebrow">How to order</div>
          <div className="steps">
            {[
              ["01", "Choose", "Pick your fragrance, for him or for her."],
              ["02", "Order", "Add it to your bag and check out in a few taps."],
              ["03", "Unwrap", "Your MIJAB arrives ready to gift, or to keep."],
            ].map(([n, t, d]) => (
              <div className="step" key={n}>
                <div className="no">{n}</div>
                <div className="txt">
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- finale ---------- */}
      <section className="finale only-desktop">
        <div className="wrap">
          <Link href={`/product/${noir.slug}`} className="finale-card">
            <ProductMedia product={noir} sizes="264px" />
            <div className="cap"><b>For Him</b><i>{noir.name} · {formatPrice(noir.price)}</i></div>
          </Link>
          <div className="finale-mid">
            <Logo width={100} title="MIJAB" />
            <div className="eyebrow">Discover MIJAB</div>
            <h2>Find the one that <i>finds you.</i></h2>
            <div className="rule" />
            <p>Two fragrances. One signature. Choose yours.</p>
            <Link href="/shop" className="btn">Explore the Collection <Arrow stroke="#F6EAE2" /></Link>
          </div>
          <Link href={`/product/${vanilla.slug}`} className="finale-card">
            <ProductMedia product={vanilla} sizes="264px" />
            <div className="cap"><b>For Her</b><i>{vanilla.name} · {formatPrice(vanilla.price)}</i></div>
          </Link>
        </div>
      </section>
    </>
  );
}

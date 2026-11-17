import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AddToBag } from "@/components/Buttons";
import { Arrow, Diamond, Gift, Heart, Lotus } from "@/components/Icons";
import { fetchCatalog } from "@/lib/catalog";
import { formatPrice, isWax, lookImage, PRODUCT_ORDER } from "@/lib/products";
import { Banner } from "@/components/lux/Banner";
import "./about.css";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "The story behind MIJAB: a Pakistani fragrance house making Café Noir for him, Vanilla Gourmand for her, The Duo and the alcohol-free Perfume Wax, each arriving gift-ready.",
  alternates: { canonical: "/about" },
};
export const revalidate = 0;

const values = [
  { icon: Diamond, t: "Premium Quality", d: "Fine ingredients for\nlong-lasting fragrance." },
  { icon: Lotus, t: "Elegant Essence", d: "Refined scents with\na modern character." },
  { icon: Gift, t: "Perfect for Gifting", d: "Beautifully packaged\nfor every occasion." },
  { icon: Heart, t: "Made with Love", d: "Thoughtfully crafted\nwith care and passion." },
];

export default async function AboutPage() {
  const catalog = await fetchCatalog();
  const items = PRODUCT_ORDER.map((id) => catalog[id]).filter(Boolean);

  return (
    <div className="lx la">
      <Banner desktop="/images/shop/banner.jpg" mobile="/images/shop/banner-m.jpg">
        <div className="lx-eyebrow gold lined">Our Story</div>
        <h1>The <em>Essence of</em> MIJAB</h1>
        <p>Some things are more than a fragrance. They are a feeling, a memory, a little touch of confidence.</p>
      </Banner>

      <section className="lx-wrap la-story">
        <div className="la-story-img">
          <Image src="/images/about/story.jpg" alt="MIJAB Café Noir and Vanilla Gourmand side by side" fill sizes="(max-width: 820px) 100vw, 560px" />
        </div>
        <div className="la-story-copy">
          <h2>MIJAB began with a simple idea: <em>everyday moments deserve a little elegance.</em></h2>
          <p>
            A Pakistani fragrance house, MIJAB creates refined, long-lasting scents for him, for her, and for together. Our fragrances are made with
            carefully chosen notes, modern character and a deep love for timeless elegance, and every one arrives gift-ready in its signature bag.
          </p>
        </div>
      </section>

      <section className="lx-wrap la-values" aria-label="What we stand for">
        {values.map(({ icon: Icon, t, d }) => (
          <div className="la-value" key={t}>
            <Icon size={34} stroke="currentColor" width={1} />
            <b>{t}</b>
            <span>{d}</span>
          </div>
        ))}
      </section>

      <section className="lx-wrap la-col" aria-labelledby="la-col-title">
        <h2 className="lx-eyebrow gold lined both" id="la-col-title">Meet the Collection</h2>
        <div className="la-col-grid">
          {items.map((p) => (
            <article className="la-mini" key={p.id}>
              <Link href={`/product/${p.slug}`} className="la-mini-img"><Image src={lookImage(p)} alt={`MIJAB ${p.name}`} fill sizes="(max-width: 820px) 46vw, 140px" /></Link>
              <div className="la-mini-body">
                <Link href={`/product/${p.slug}`} className="la-mini-name">{p.name}</Link>
                {p.id === "duo" ? <span className="la-mini-sub">Café Noir + Vanilla Gourmand</span> : isWax(p) ? <span className="lx-new">Perfume Wax</span> : <span className="lx-tag">{p.audience}</span>}
                <div className="la-mini-price">{formatPrice(p.price)}{p.compareAt && p.compareAt > p.price && <s>{formatPrice(p.compareAt)}</s>}</div>
                <AddToBag id={p.id} className="lx-btn dark sm" label="Add to Bag" icon go={null} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="la-cta">
        <Image src="/images/home/story.jpg" alt="" fill sizes="100vw" className="la-cta-img" />
        <div className="la-cta-in">
          <h2><em>Find the one that finds you.</em></h2>
          <Link href="/shop" className="lx-btn gold">Shop the Collection <Arrow /></Link>
        </div>
      </section>
    </div>
  );
}

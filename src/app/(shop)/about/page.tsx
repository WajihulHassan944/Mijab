import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/Icons";
import { ProductMedia } from "@/components/Media";
import { fetchCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "About" };
export const revalidate = 0;

const values = [
  ["01", "Individuality", "Two fragrances with their own character, because no two people wear a scent the same way."],
  ["02", "Elegance", "Clean lines, quiet details and a finish that feels considered, from the bottle to the bag."],
  ["03", "Moments", "Made for the evenings, the meetings and the little occasions you want to remember."],
];

export default async function AboutPage() {
  const catalog = await fetchCatalog();
  const fragrances = [catalog["cafe-noir"], catalog["vanilla-gourmand"]].filter(Boolean);
  return (
    <>
      <section className="about-hero">
        <div className="in">
          <div className="l">
            <div className="eyebrow">Our Story</div>
            <h1 className="h1">More than a scent. A feeling.</h1>
            <p className="lead">MIJAB is a celebration of individuality, elegance and the little moments that make life beautiful.</p>
          </div>
          <div className="r"><Image src="/images/petal.jpg" alt="Soft pink petal with the MIJAB monogram" fill sizes="480px" priority /></div>
        </div>
      </section>

      <div className="wrap">
        <section className="quote" style={{ padding: "80px 96px" }}>&ldquo;A fragrance isn&apos;t just worn. It&apos;s felt. It becomes a part of your story.&rdquo;</section>
        <section className="values">
          {values.map(([n, t, d]) => (
            <div key={n}><div className="no">{n}</div><h3>{t}</h3><p>{d}</p></div>
          ))}
        </section>
      </div>

      <section className="about-coll">
        <div className="wrap">
          <div className="hd"><div className="eyebrow">The Collection</div><h2>Two Fragrances. One Identity.</h2></div>
          <div className="cards">
            {fragrances.map((p) => (
              <Link href={`/product/${p.slug}`} className="card-p" key={p.id}>
                <ProductMedia product={p} sizes="(max-width: 820px) 100vw, 420px" />
                <div className="eyebrow" style={{ marginTop: 16 }}>{p.audience}</div>
                <div className="n">{p.name}</div>
                <div className="b">{p.blurb}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="about-exp">
        <Image src="/images/couple.jpg" alt="A couple sharing a close, quiet moment" fill sizes="100vw" />
        <div className="in">
          <div className="eyebrow">The MIJAB Experience</div>
          <h2>Elegance in Every Moment</h2>
          <Link href="/shop" className="btn-blush">Shop MIJAB <Arrow stroke="#2A1D18" /></Link>
        </div>
      </section>
    </>
  );
}

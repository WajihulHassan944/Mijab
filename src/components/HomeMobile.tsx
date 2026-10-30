"use client";

import Image from "next/image";
import { useState } from "react";
import { Product } from "@/lib/products";
import { Arrow } from "./Icons";

/** Mobile home hero: static banner mirroring the desktop hero — headline,
 * CTA into the collection, and the signature duo shot. */
export function MobileHero({ fragrances: _fragrances }: { fragrances: Product[] }) {
  return (
    <section className="m-hero only-mobile">
      <div className="eyebrow">Exclusive Fragrances</div>
      <h1>More Than Just a Scent</h1>
      <div className="it">It&apos;s a feeling. It&apos;s you.</div>
      <p className="label-line">Two signature fragrances. One beautiful story.</p>
      <a className="btn" href="#collection">Explore the Collection <Arrow stroke="#F6EAE2" /></a>
      <div className="m-hero-shot">
        <Image src="/images/duo.jpg" alt="MIJAB Café Noir and Vanilla Gourmand" fill sizes="100vw" priority />
      </div>
    </section>
  );
}

/** Mobile scent notes: follows the For Him / For Her choice made in the hero. */
export function MobileNotes({ fragrances }: { fragrances: Product[] }) {
  const [pick, setPick] = useState<"cafe-noir" | "vanilla-gourmand">("cafe-noir");
  const p = fragrances.find((f) => f.id === pick) ?? fragrances[0];
  return (
    <div className="note-col only-mobile">
      <div className="seg" role="tablist" aria-label="Scent notes" style={{ borderColor: "#d2bfb3", marginTop: 0, marginBottom: 20 }}>
        {fragrances.map((f) => (
          <button key={f.id} role="tab" aria-selected={pick === f.id} className={pick === f.id ? "on" : ""} style={{ color: pick === f.id ? undefined : "#6b5a52", background: pick === f.id ? "#2a1d18" : undefined, ...(pick === f.id ? { color: "#f6eae2" } : {}) }} onClick={() => setPick(f.id as typeof pick)}>
            {f.audience}
          </button>
        ))}
      </div>
      <div className="note-head">
        <div className="disc"><Image src={p.image} alt="" fill sizes="120px" /></div>
        <div><b>{p.audience}</b><i>{p.name}</i></div>
      </div>
      <div className="note-row"><span className="k">Top</span><span className="v">{p.notes!.top}</span></div>
      <div className="note-row"><span className="k">Heart</span><span className="v">{p.notes!.heart}</span></div>
      <div className="note-row"><span className="k">Base</span><span className="v">{p.notes!.base}</span></div>
    </div>
  );
}

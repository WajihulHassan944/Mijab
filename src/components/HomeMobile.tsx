"use client";

import Image from "next/image";
import { useState } from "react";
import { formatPrice, Product } from "@/lib/products";
import { useStore } from "@/lib/store";
import { QtyStepper } from "./Buttons";
import { Media } from "./Media";

/** Mobile home hero: For Him / For Her switcher with a featured product. */
export function MobileHero({ fragrances }: { fragrances: Product[] }) {
  const [pick, setPick] = useState<"cafe-noir" | "vanilla-gourmand">("cafe-noir");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useStore();
  const p = fragrances.find((f) => f.id === pick) ?? fragrances[0];
  return (
    <section className="m-hero only-mobile">
      <div className="eyebrow">Exclusive Fragrances</div>
      <h1>More Than Just a Scent</h1>
      <div className="it">It&apos;s a feeling. It&apos;s you.</div>
      <div className="seg" role="tablist" aria-label="Choose fragrance">
        {fragrances.map((f) => (
          <button key={f.id} role="tab" aria-selected={pick === f.id} className={pick === f.id ? "on" : ""} onClick={() => setPick(f.id as typeof pick)}>
            {f.audience}
          </button>
        ))}
      </div>
      <Media src={p.image} alt={`MIJAB ${p.name}`} bg={p.swatch} priority sizes="100vw">
        <div className="tg">{p.tagline.replace(/ \/ /g, "  /  ")}</div>
      </Media>
      <div className="nm"><span className="n">{p.name}</span><span className="p">{formatPrice(p.price)}</span></div>
      <div className="sub">Eau de Parfum · 50 ml</div>
      <div className="buy">
        <QtyStepper value={qty} onChange={setQty} />
        <button
          className="btn"
          onClick={() => {
            add(p.id, qty);
            setAdded(true);
            setTimeout(() => setAdded(false), 1400);
          }}
        >
          {added ? "Added to bag" : "Add to bag"}
        </button>
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

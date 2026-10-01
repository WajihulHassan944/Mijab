"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { QtyStepper } from "@/components/Buttons";
import { Arrow, Gift, Lock, Truck } from "@/components/Icons";
import { Media } from "@/components/Media";
import { formatPrice, Product } from "@/lib/products";
import { useStore } from "@/lib/store";

export function PurchasePanel({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [view, setView] = useState<"bottle" | "bag" | "duo">("bottle");
  const { add, products } = useStore();
  const duoImage = products.duo?.image ?? product.image;
  const router = useRouter();

  const thumbs = [
    { id: "bottle" as const, label: `${product.name} bottle` },
    { id: "bag" as const, label: product.bagLabel! },
    { id: "duo" as const, label: "The Duo" },
  ];

  return (
    <section className="pdp">
      <div className="pdp-gallery">
        <div className="media main" style={{ background: view === "bottle" ? product.swatch : "var(--sand)" }}>
          {view === "bottle" && <Image src={product.image} alt={`MIJAB ${product.name}`} fill sizes="(max-width: 820px) 100vw, 440px" priority />}
          {view === "duo" && <Image src={duoImage} alt="MIJAB Café Noir and Vanilla Gourmand" fill sizes="(max-width: 820px) 100vw, 440px" />}
          {view === "bag" && <Image src={product.bag!} alt={product.bagLabel!} fill sizes="(max-width: 820px) 100vw, 440px" style={{ objectFit: "contain", padding: 32 }} />}
        </div>
        <div className="thumbs">
          {thumbs.map((t) => (
            <button key={t.id} className={`thumb${view === t.id ? " on" : ""}`} onClick={() => setView(t.id)} aria-label={`Show ${t.label}`} aria-pressed={view === t.id}>
              {t.id === "bottle" && <Media src={product.image} alt="" bg={product.swatch} sizes="136px" />}
              {t.id === "duo" && <Media src={duoImage} alt="" sizes="136px" />}
              {t.id === "bag" && <Image className="bagimg" src={product.bag!} alt="" width={69} height={106} />}
            </button>
          ))}
        </div>
      </div>

      <div className="pdp-info">
        <div className="eyebrow">{product.audience} · Eau de Parfum</div>
        <h1>{product.name}</h1>
        <div className="tag">{product.tagline}</div>
        <div className="price">{formatPrice(product.price)}</div>
        <div className="rule" />
        <p className="lead">{product.description}</p>
        <div className="eyebrow" style={{ marginTop: 26 }}>Size</div>
        <div style={{ marginTop: 10 }}><span className="size-chip">50 ml</span></div>
        <div className="buy-row">
          <QtyStepper value={qty} onChange={setQty} />
          <button className="btn" style={{ flex: 1 }} onClick={() => { add(product.id, qty); router.push("/bag"); }}>Add to bag</button>
        </div>
        <button className="btn-outline" style={{ marginTop: 12 }} onClick={() => { add(product.id, qty); router.push("/checkout"); }}>
          Buy now <Arrow stroke="#2A1D18" />
        </button>
        <div className="assure">
          <div><Gift size={18} />Signature MIJAB bag included</div>
          <div><Lock size={18} />Secure checkout</div>
          <div><Truck size={18} />Delivery shown at checkout</div>
        </div>
      </div>
    </section>
  );
}

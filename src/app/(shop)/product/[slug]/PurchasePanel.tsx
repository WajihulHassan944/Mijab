"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { QtyStepper } from "@/components/Buttons";
import { Arrow, Gift, Lock, Truck } from "@/components/Icons";
import { Media } from "@/components/Media";
import { formatPrice, Product } from "@/lib/products";
import { useStore } from "@/lib/store";

/** One picture in the product gallery. `contain` is for cut-out images (the
 * bags) that should sit inside the frame rather than fill it. */
export type GalleryImage = { id: string; src: string; alt: string; bg?: string; contain?: boolean };

type Props = {
  product: Product;
  /** Defaults to bottle, bag and the Duo, which suits a single fragrance. */
  gallery?: GalleryImage[];
  eyebrow?: string;
  size?: string;
};

export function PurchasePanel({ product, gallery, eyebrow, size = "50 ml" }: Props) {
  const [qty, setQty] = useState(1);
  const { add, products } = useStore();
  const router = useRouter();

  const images: GalleryImage[] = gallery ?? [
    { id: "bottle", src: product.image, alt: `MIJAB ${product.name}`, bg: product.swatch },
    ...(product.bag ? [{ id: "bag", src: product.bag, alt: product.bagLabel ?? "MIJAB bag", contain: true }] : []),
    { id: "duo", src: products.duo?.image ?? product.image, alt: "MIJAB Café Noir and Vanilla Gourmand" },
  ];
  const [view, setView] = useState(images[0].id);
  const current = images.find((i) => i.id === view) ?? images[0];
  const saving = product.compareAt && product.compareAt > product.price ? product.compareAt - product.price : 0;

  return (
    <section className="pdp">
      <div className="pdp-gallery">
        <div className="media main" style={{ background: current.bg ?? "var(--sand)" }}>
          <Image
            key={current.id}
            src={current.src}
            alt={current.alt}
            fill
            sizes="(max-width: 820px) 100vw, 440px"
            priority={current.id === images[0].id}
            style={current.contain ? { objectFit: "contain", padding: 32 } : undefined}
          />
        </div>
        <div className="thumbs">
          {images.map((t) => (
            <button key={t.id} className={`thumb${view === t.id ? " on" : ""}`} onClick={() => setView(t.id)} aria-label={`Show ${t.alt}`} aria-pressed={view === t.id}>
              {t.contain
                ? <Image className="bagimg" src={t.src} alt="" width={69} height={106} />
                : <Media src={t.src} alt="" bg={t.bg} sizes="136px" />}
            </button>
          ))}
        </div>
      </div>

      <div className="pdp-info">
        <div className="eyebrow">{eyebrow ?? `${product.audience} · Eau de Parfum`}</div>
        <h1>{product.name}</h1>
        <div className="tag">{product.tagline}</div>
        <div className="price">
          {formatPrice(product.price)}
          {saving > 0 && <> <span className="strike" style={{ fontSize: 18, marginLeft: 10 }}>{formatPrice(product.compareAt!)}</span></>}
        </div>
        {saving > 0 && <div className="eyebrow" style={{ marginTop: 6 }}>You save {formatPrice(saving)}</div>}
        <div className="rule" />
        <p className="lead">{product.description}</p>
        <div className="eyebrow" style={{ marginTop: 26 }}>Size</div>
        <div style={{ marginTop: 10 }}><span className="size-chip">{size}</span></div>
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

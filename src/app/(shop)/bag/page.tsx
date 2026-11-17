"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Arrow, BagIcon, Cash, ChevronLeft, CloseIcon, ShieldCheck, Truck } from "@/components/Icons";
import { SummaryRows } from "@/components/Summary";
import { DeliveryMethod } from "@/components/DeliveryMethod";
import { formatLine, formatPrice, lookImage } from "@/lib/products";
import { useStore } from "@/lib/store";

function Hero({ title, sub }: { title: string; sub: string }) {
  return (
    <section className="lx-phero">
      <Image src="/images/shop/banner.jpg" alt="" fill priority sizes="100vw" className="lx-phero-img" />
      <div className="lx-phero-shade" />
      <div className="lx-wrap lx-phero-copy">
        <div className="lx-eyebrow gold lined">Your Bag</div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
    </section>
  );
}

export default function BagPage() {
  const { cart, count, totals, promo, setQty, remove, applyPromo, ready, products, fulfillment, settings } = useStore();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (ready && cart.length === 0) {
    return (
      <div className="lx">
        <Hero title="Your bag is empty" sub="Your next favourite fragrance is waiting." />
        <div className="lx-wrap lb-empty">
          <Link href="/shop" className="lx-btn dark">Shop the Collection <Arrow /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lx">
      <Hero title="Your Selected Fragrances" sub="A little elegance, just for you." />

      <div className="lx-wrap lb-grid">
        <section className="lx-panel lb-lines" aria-label={`${count} item${count === 1 ? "" : "s"} in your bag`}>
          {cart.map((l) => {
            const p = products[l.id];
            if (!p) return null;
            return (
              <div className="lb-line" key={l.id}>
                <Link href={`/product/${p.slug}`} className="lb-thumb"><Image src={lookImage(p)} alt={`MIJAB ${p.name}`} fill sizes="120px" /></Link>
                <div className="lb-info">
                  <Link href={`/product/${p.slug}`} className="lb-name">{p.name}</Link>
                  {l.id !== "duo" && l.id !== "perfume-wax" && <span className="lx-tag">{p.audience}</span>}
                  <span className="lb-meta">{l.id === "duo" ? "Both fragrances · 2 × 50 ml" : formatLine(p)}</span>
                  <div className="lp-qty lb-qty">
                    <button type="button" aria-label={`Decrease ${p.name} quantity`} onClick={() => setQty(l.id, Math.max(1, l.qty - 1))}>−</button>
                    <span aria-live="polite">{l.qty}</span>
                    <button type="button" aria-label={`Increase ${p.name} quantity`} onClick={() => setQty(l.id, Math.min(10, l.qty + 1))}>+</button>
                  </div>
                </div>
                <div className="lb-price">{formatPrice(p.price * l.qty)}</div>
                <button type="button" className="lb-rm" aria-label={`Remove ${p.name}`} onClick={() => remove(l.id)}><CloseIcon size={18} stroke="currentColor" width={1.4} /></button>
              </div>
            );
          })}
          <Link href="/shop" className="lb-back"><ChevronLeft size={16} stroke="currentColor" /> Continue shopping</Link>
        </section>

        <aside className="lx-panel lb-sum">
          <h2>Order Summary</h2>
          <div className="lb-sub">Delivery method</div>
          <DeliveryMethod compact />
          <div className="lb-rows"><SummaryRows {...totals} promo={promo} deliveryLabel={fulfillment === "pickup" ? "Store pickup" : undefined} /></div>
          <form
            className="lb-promo"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await applyPromo(code);
              setMsg(ok ? { ok, text: "Promo applied." } : { ok, text: "That code isn't valid." });
            }}
          >
            <input aria-label="Promo code" placeholder="Enter promo code" value={code} onChange={(e) => setCode(e.target.value)} />
            <button type="submit" className="lx-btn dark sm">Apply</button>
          </form>
          {msg && <div className={`lb-msg${msg.ok ? " ok" : ""}`} role="status">{msg.text}</div>}
          <Link href="/checkout" className="lx-btn dark lb-checkout"><BagIcon size={18} stroke="currentColor" width={1.4} /> Checkout <Arrow /></Link>
        </aside>
      </div>

      <div className="lx-wrap">
        <div className="lb-trust">
          {settings.cod && <div><Cash size={30} stroke="currentColor" width={1.1} /><span>Cash on Delivery</span></div>}
          <div><Truck size={30} stroke="currentColor" width={1.1} /><span>Delivered in 2–4 working<br />days across Pakistan</span></div>
          <div><ShieldCheck size={30} stroke="currentColor" width={1.1} /><span>Secure<br />checkout</span></div>
        </div>
      </div>
    </div>
  );
}

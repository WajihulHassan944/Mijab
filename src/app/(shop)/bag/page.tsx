"use client";

import Link from "next/link";
import { useState } from "react";
import { Arrow, ChevronLeft, Gift, Lock } from "@/components/Icons";
import { ProductMedia } from "@/components/Media";
import { QtyStepper } from "@/components/Buttons";
import { SummaryRows } from "@/components/Summary";
import { formatPrice, products } from "@/lib/products";
import { useStore } from "@/lib/store";

export default function BagPage() {
  const { cart, count, totals, promo, setQty, remove, applyPromo, ready } = useStore();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (ready && cart.length === 0) {
    return (
      <div className="wrap empty">
        <div className="eyebrow">Your Bag</div>
        <h1 className="h1" style={{ margin: "12px 0 14px" }}>Your bag is empty</h1>
        <p className="lead" style={{ marginBottom: 28 }}>Two fragrances are waiting for you.</p>
        <Link href="/shop" className="btn fit" style={{ display: "inline-flex", width: 240 }}>Shop MIJAB <Arrow stroke="#F6EAE2" /></Link>
      </div>
    );
  }

  return (
    <div className="wrap">
      <section style={{ padding: "48px 0 24px" }}>
        <div className="eyebrow">Your Bag</div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 16 }}>
          <h1 className="h1" style={{ fontSize: 56 }}>Your Bag</h1>
          <span style={{ fontSize: 13, fontWeight: 300, color: "var(--muted)" }}>{count} item{count === 1 ? "" : "s"}</span>
        </div>
      </section>

      <section className="layout-2" style={{ paddingBottom: 64 }}>
        <div className="main">
          <div className="bag-lines">
            {cart.map((l) => {
              const p = products[l.id];
              return (
                <div className="bag-line" key={l.id}>
                  <ProductMedia product={p} sizes="100px" />
                  <div className="info">
                    <div>
                      <div className="top">
                        <Link href={l.id === "duo" ? "/shop" : `/product/${p.slug}`}>{p.name}</Link>
                        <div className="p">{formatPrice(p.price * l.qty)}</div>
                      </div>
                      <div className="meta">{l.id === "duo" ? "Both fragrances · 2 × 50 ml" : `${p.audience} · Eau de Parfum · 50 ml`}</div>
                    </div>
                    <div className="ctl">
                      <QtyStepper value={l.qty} onChange={(n) => setQty(l.id, n)} />
                      <button className="rm" onClick={() => remove(l.id)}>Remove</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="gift-strip" style={{ marginTop: 24 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/bag-pink.png" alt="" />
            <div style={{ flex: 1 }}>
              <div className="t">Signature gift bag</div>
              <div className="s">Included with every order. Pink for her, black for him.</div>
            </div>
            <Gift size={24} />
          </div>

          <Link href="/shop" className="back-link"><ChevronLeft size={16} stroke="#9B6B66" /> Continue shopping</Link>
        </div>

        <aside className="summary">
          <h2>Order summary</h2>
          <div style={{ marginTop: 16 }}><SummaryRows {...totals} promo={promo} /></div>
          <form
            className="promo"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await applyPromo(code);
              setMsg(ok ? { ok, text: "Promo applied." } : { ok, text: "That code isn't valid. Try WELCOME10." });
            }}
          >
            <input className="input" aria-label="Promo code" placeholder="Promo code" value={code} onChange={(e) => setCode(e.target.value)} />
            <button type="submit">Apply</button>
          </form>
          {msg && <div className="promo-msg" style={{ color: msg.ok ? "var(--brown)" : "#a4443b" }}>{msg.text}</div>}
          <Link href="/checkout" className="btn" style={{ marginTop: 20 }}>Checkout <Arrow stroke="#F6EAE2" /></Link>
          <div className="secure"><Lock size={16} stroke="#6b5a52" /> Secure checkout</div>
        </aside>
      </section>
    </div>
  );
}

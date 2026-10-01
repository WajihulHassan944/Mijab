"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Arrow, Check } from "@/components/Icons";
import { ProductMedia } from "@/components/Media";
import { SummaryRows } from "@/components/Summary";
import { formatPrice, products } from "@/lib/products";
import { useStore } from "@/lib/store";

export default function ConfirmationPage() {
  return (
    <Suspense>
      <Confirmation />
    </Suspense>
  );
}

function Confirmation() {
  const { lastOrder, orders } = useStore();
  const wanted = useSearchParams().get("order");
  const o = orders.find((x) => x.id === wanted) ?? lastOrder;
  return (
    <div className="wrap">
      <section className="confirm-head">
        <div className="ok"><Check size={30} /></div>
        <div className="eyebrow">Order confirmed</div>
        <h1 className="h1">Thank you for choosing MIJAB.</h1>
        <p>Order <b>{o.id}</b> · Placed on {o.placedOn}</p>
      </section>

      <section className="two-cards">
        <div>
          <h2>Order summary</h2>
          {o.lines.map((l) => (
            <div className="mini-line" key={l.id}>
              <ProductMedia product={products[l.id]} sizes="56px" />
              <div><div className="n">{products[l.id].name}</div><div className="q">Qty {l.qty}</div></div>
              <div className="p">{formatPrice(products[l.id].price * l.qty)}</div>
            </div>
          ))}
          <div style={{ marginTop: 12 }}><SummaryRows subtotal={o.subtotal} discount={o.discount} delivery={o.delivery} total={o.total} /></div>
        </div>
        <div>
          <h2>Delivery details</h2>
          <div className="kv"><div className="k">Name</div><div className="v">{o.name}</div></div>
          <div className="kv"><div className="k">Address</div><div className="v">{o.address}<br />{o.city}</div></div>
          <div className="kv"><div className="k">Contact</div><div className="v">{o.email}<br />{o.phone}</div></div>
          <div className="kv"><div className="k">Payment</div><div className="v">{o.payment}</div></div>
        </div>
      </section>

      <section className="cta-pair">
        <Link href={`/track?order=${o.id}`} className="btn">Track your order <Arrow stroke="#F6EAE2" /></Link>
        <Link href="/shop" className="btn-outline">Continue shopping <Arrow stroke="#2A1D18" /></Link>
      </section>

      <section className="bag-note">
        <div className="imgs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/bag-pink.png" alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/bag-black.png" alt="" />
        </div>
        <div className="t">Your order will arrive in a signature MIJAB bag.</div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Arrow, Check } from "@/components/Icons";
import { ProductMedia } from "@/components/Media";
import { SummaryRows } from "@/components/Summary";
import { formatPrice } from "@/lib/products";
import { clearPendingPaymentHandoff, Order, readPendingPaymentHandoff, useStore } from "@/lib/store";

export default function ConfirmationPage() {
  return (
    <Suspense>
      <Confirmation />
    </Suspense>
  );
}

function Confirmation() {
  const { lastOrder, orders, ready, products, findOrder } = useStore();
  const wanted = useSearchParams().get("order");
  const [recovered, setRecovered] = useState<Order | null>(null);
  const [recovering, setRecovering] = useState(false);
  const o = orders.find((x) => x.id === wanted) ?? lastOrder ?? recovered;

  // Returning from Safepay's hosted checkout is a full page reload, which
  // wipes the in-memory store — a guest's order wouldn't otherwise be found
  // here. Recover it the same way /track does: by its own order id + phone,
  // handed off via localStorage right before the redirect to Safepay.
  useEffect(() => {
    if (o || !wanted || !ready) return;
    const pending = readPendingPaymentHandoff();
    if (!pending || pending.id !== wanted) return;
    setRecovering(true);
    findOrder(pending.id, pending.phone).then((found) => {
      setRecovering(false);
      if (found) {
        setRecovered(found);
        if (found.paymentStatus !== "pending") clearPendingPaymentHandoff();
      }
    });
  }, [o, wanted, ready, findOrder]);

  if (!o) {
    return (
      <div className="wrap empty">
        {ready && !recovering && (
          <>
            <div className="eyebrow">Order confirmed</div>
            <h1 className="h1" style={{ margin: "12px 0 14px" }}>We couldn&apos;t find that order</h1>
            <p className="lead" style={{ marginBottom: 28 }}>
              Track it with your order number and phone, or check your account.
            </p>
            <Link href="/track" className="btn" style={{ display: "inline-flex", width: 240 }}>Track an order</Link>
          </>
        )}
      </div>
    );
  }

  if (o.paymentStatus === "pending") {
    return (
      <div className="wrap empty">
        <div className="eyebrow">Order {o.id}</div>
        <h1 className="h1" style={{ margin: "12px 0 14px" }}>Confirming your payment…</h1>
        <p className="lead" style={{ marginBottom: 28 }}>
          This usually takes just a few seconds. Refresh this page, or check your order on the track page shortly.
        </p>
        <Link href={`/track?order=${o.id}`} className="btn" style={{ display: "inline-flex", width: 240 }}>Track this order</Link>
      </div>
    );
  }

  if (o.paymentStatus === "failed") {
    return (
      <div className="wrap empty">
        <div className="eyebrow">Order {o.id}</div>
        <h1 className="h1" style={{ margin: "12px 0 14px" }}>Payment didn&apos;t go through</h1>
        <p className="lead" style={{ marginBottom: 28 }}>
          The card payment for this order failed, so it&apos;s been cancelled and nothing was charged.
        </p>
        <Link href="/checkout" className="btn" style={{ display: "inline-flex", width: 240 }}>Try again</Link>
      </div>
    );
  }

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
              {products[l.id] && <ProductMedia product={products[l.id]} sizes="56px" />}
              <div><div className="n">{l.name}</div><div className="q">Qty {l.qty}</div></div>
              <div className="p">{formatPrice(l.price * l.qty)}</div>
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

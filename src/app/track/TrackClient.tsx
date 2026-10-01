"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Arrow, Check } from "@/components/Icons";
import { Media } from "@/components/Media";
import { formatPrice, products } from "@/lib/products";
import { Order, useStore } from "@/lib/store";

const steps = [
  { name: "Order placed", sub: "" },
  { name: "Packed", sub: "Your order is packed" },
  { name: "Out for delivery", sub: "On its way to you" },
  { name: "Delivered", sub: "Arrives at your door" },
];
const badge = ["Confirmed", "Packed", "In transit", "Delivered"];
const bg = ["#EFE4DD", "#EFE4DD", "#DCCBE6", "#E4D3C6"];

export function TrackClient() {
  const params = useSearchParams();
  const { findOrder, orders } = useStore();
  const initialId = params.get("order") ?? "MJB-10482";
  const seed = orders.find((o) => o.id === initialId);
  const [id, setId] = useState(initialId);
  const [phone, setPhone] = useState(seed?.phone ?? "0300 0000000");
  const [result, setResult] = useState<Order | null | undefined>(() => (seed ? findOrder(seed.id, seed.phone) : undefined));
  const [searched, setSearched] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    setSearched(true);
    setResult(findOrder(id, phone));
  }

  return (
    <div className="wrap">
      <section style={{ padding: "56px 0 28px" }}>
        <div className="eyebrow">Track Order</div>
        <h1 className="h1" style={{ marginTop: 14 }}>Where is my MIJAB?</h1>
        <p className="lead" style={{ marginTop: 16, maxWidth: 480 }}>Enter your order number and the phone number you used at checkout.</p>
      </section>

      <form className="track-form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="f-order">Order number</label>
          <input id="f-order" className="input" placeholder="MJB-10482" value={id} onChange={(e) => setId(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="f-phone">Phone number</label>
          <input id="f-phone" className="input" type="tel" placeholder="03xx xxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <button className="btn" type="submit">Track <Arrow stroke="#F6EAE2" /></button>
      </form>

      {result === null && searched && (
        <div className="card" style={{ marginBottom: 72 }} role="alert">
          We couldn&apos;t find an order with those details. Check the order number and phone number, or <a href="/contact" style={{ textDecoration: "underline" }}>contact us</a>.
        </div>
      )}

      {result && (
        <section className="track-card">
          <div className="track-head">
            <div>
              <div className="eyebrow">Order {result.id}</div>
              <div className="st">{steps[result.stage].name}</div>
            </div>
            <span className="status" style={{ background: bg[result.stage] }}>{badge[result.stage]}</span>
          </div>

          <ol className="timeline" style={{ listStyle: "none", padding: 0, margin: "36px 0 0" }}>
            {steps.map((s, i) => {
              const done = i < result.stage || result.stage === 3;
              const now = i === result.stage && result.stage !== 3;
              return (
                <li className="tl-step" key={s.name}>
                  <div className={`tl-dot${done ? " done" : now ? " now" : ""}`}>
                    {done && <Check size={18} stroke="#F6EAE2" />}
                    {now && <i />}
                  </div>
                  {i < steps.length - 1 && <div className={`tl-line${done ? " done" : ""}`} />}
                  <div className="txt">
                    <b className={!done && !now ? "off" : ""}>{s.name}</b>
                    <span>{i === 0 ? result.placedOn : s.sub}</span>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="track-cols">
            <div>
              <div className="eyebrow">Items</div>
              <div className="thumbs-sm">
                {result.lines.map((l) => <Media key={l.id} src={products[l.id].image} alt={products[l.id].name} bg={products[l.id].swatch} sizes="64px" />)}
              </div>
            </div>
            <div>
              <div className="eyebrow">Delivering to</div>
              <div className="v">{result.name}<br />{result.address}<br />{result.city.split(",")[0]}</div>
            </div>
            <div>
              <div className="eyebrow">Payment</div>
              <div className="v">{result.payment}<br />Total {formatPrice(result.total)}</div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

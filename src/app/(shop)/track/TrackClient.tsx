"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Arrow, Check } from "@/components/Icons";
import { Media } from "@/components/Media";
import { formatPrice, products } from "@/lib/products";
import { fromApi, Order, useStore } from "@/lib/store";
import { getPusher } from "@/lib/pusher-client";
import { ApiOrder } from "@/lib/api";

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
  const { findOrder } = useStore();
  const [id, setId] = useState(params.get("order") ?? "");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<Order | null | undefined>(undefined);
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSearched(true);
    setBusy(true);
    setResult(await findOrder(id, phone));
    setBusy(false);
  }

  // keep the order field in sync if the user arrives via /track?order=MJB-xxxxx
  useEffect(() => {
    const fromQuery = params.get("order");
    if (fromQuery) setId(fromQuery);
  }, [params]);

  // live status updates while this order is on screen (admin marks it packed/out/delivered)
  useEffect(() => {
    if (!result) return;
    const pusher = getPusher();
    if (!pusher) return;
    const channel = pusher.subscribe(`mijab-order-${result.id}`);
    const onUpdate = (payload: ApiOrder) => setResult(fromApi(payload));
    channel.bind("order:update", onUpdate);
    return () => {
      channel.unbind("order:update", onUpdate);
      pusher.unsubscribe(`mijab-order-${result.id}`);
    };
  }, [result?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <button className="btn" type="submit" disabled={busy}>{busy ? "Searching…" : "Track"} <Arrow stroke="#F6EAE2" /></button>
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

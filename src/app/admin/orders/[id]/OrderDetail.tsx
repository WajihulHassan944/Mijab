"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ICheck, IPrint } from "@/components/admin/AIcons";
import { Card, PageHeader, StatusBadge } from "@/components/admin/UI";
import { STATUS_FLOW, STATUS_LABEL, Status, longDate, money } from "@/lib/admin-data";
import { useAdmin } from "@/lib/admin-store";

const NEXT: Partial<Record<Status, { to: Status; label: string }>> = {
  placed: { to: "packed", label: "Mark as packed" },
  packed: { to: "out", label: "Mark out for delivery" },
  out: { to: "delivered", label: "Mark as delivered" },
};

export function OrderDetail({ id }: { id: string }) {
  const { orders, products, setStatus, notes, setNote } = useAdmin();
  const o = orders.find((x) => x.id === id);
  const [note, setLocal] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => setLocal(notes[id] ?? ""), [id, notes]);

  if (!o) {
    return (
      <>
        <PageHeader title="Order not found" back={{ href: "/admin/orders", label: "Orders" }} />
        <p>We couldn&apos;t find order {id}.</p>
      </>
    );
  }

  const next = NEXT[o.status];
  const stageIdx = o.status === "cancelled" ? -1 : STATUS_FLOW.indexOf(o.status);
  const when = (i: number) => (i === 0 ? longDate(o.createdAt) : i <= stageIdx ? "Updated by admin" : "Pending");

  return (
    <>
      <PageHeader title={o.id} sub={`Placed ${longDate(o.createdAt)} · ${o.payment}`} back={{ href: "/admin/orders", label: "Orders" }}>
        <StatusBadge status={o.status} />
        <button className="abtn ghost" onClick={() => window.print()}><IPrint size={15} /> Print</button>
        {next && <button className="abtn" onClick={() => setStatus([o.id], next.to)}>{next.label}</button>}
        {o.status !== "cancelled" && o.status !== "delivered" && <button className="abtn danger" onClick={() => { if (confirm(`Cancel order ${o.id}?`)) setStatus([o.id], "cancelled"); }}>Cancel order</button>}
        {o.status === "cancelled" && <button className="abtn ghost" onClick={() => setStatus([o.id], "placed")}>Reopen</button>}
      </PageHeader>

      <div className="cols">
        <div className="stack-a">
          <Card title="Items" flush>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Product</th><th className="num">Price</th><th className="num">Qty</th><th className="num">Total</th></tr></thead>
                <tbody>
                  {o.lines.map((l) => {
                    const p = products.find((x) => x.id === l.id);
                    return (
                      <tr key={l.id}>
                        <td>
                          <div className="cell-prod">
                            {p && <span className="thumb-s" style={{ background: p.swatch }}><Image src={p.image} alt={l.name} fill sizes="38px" /></span>}
                            <div>{l.name}{p && <span className="sub">{p.audience} · 50 ml</span>}</div>
                          </div>
                        </td>
                        <td className="num">{money(l.price)}</td><td className="num">{l.qty}</td><td className="num">{money(l.price * l.qty)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "16px 22px 22px", marginLeft: "auto", maxWidth: 360 }}>
              <div className="sumrows">
                <div><span>Subtotal</span><span>{money(o.subtotal)}</span></div>
                {o.discount > 0 && <div><span>Discount</span><span>− {money(o.discount)}</span></div>}
                <div><span>Delivery</span><span>{money(o.delivery)}</span></div>
                <div className="total"><span>Total</span><span>{money(o.total)}</span></div>
              </div>
            </div>
          </Card>

          <Card title="Internal note" action={saved ? <span className="inline-note"><ICheck size={14} /> Saved</span> : undefined}>
            <textarea className="ata" aria-label="Internal note" placeholder="Add a note for your team (not visible to the customer)" value={note} onChange={(e) => { setLocal(e.target.value); setSaved(false); }} />
            <div style={{ marginTop: 10 }}><button className="abtn ghost sm" onClick={() => { setNote(o.id, note); setSaved(true); }}>Save note</button></div>
          </Card>
        </div>

        <div className="stack-a">
          <Card title="Fulfilment">
            {o.status === "cancelled" ? (
              <p className="inline-note">This order was cancelled.</p>
            ) : (
              <ol className="tline">
                {STATUS_FLOW.map((s, i) => (
                  <li key={s} className={i < stageIdx || stageIdx === 3 ? "done" : i === stageIdx ? "now" : "todo"}>
                    <span className="dot" />
                    <div><b>{STATUS_LABEL[s]}</b><small>{when(i)}</small></div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
          <Card title="Customer">
            <dl className="kv-a">
              <dt>Name</dt><dd><Link href={`/admin/customers/${encodeURIComponent(o.email)}`} style={{ textDecoration: "underline" }}>{o.name}</Link></dd>
              <dt>Email</dt><dd>{o.email}</dd>
              <dt>Phone</dt><dd>{o.phone}</dd>
            </dl>
          </Card>
          <Card title="Delivery address">
            <p style={{ lineHeight: 1.6 }}>{o.name}<br />{o.address}<br />{o.city}</p>
          </Card>
        </div>
      </div>
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { IDown } from "@/components/admin/AIcons";
import { PageHeader, StatusBadge, download } from "@/components/admin/UI";
import { STATUS_LABEL, Status, longDate, money } from "@/lib/admin-data";
import { useAdmin } from "@/lib/admin-store";
import { products } from "@/lib/products";

const TABS: ("all" | Status)[] = ["all", "placed", "packed", "out", "delivered", "cancelled"];
const PER = 10;

export function OrdersClient() {
  const { orders, setStatus } = useAdmin();
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [tab, setTab] = useState<"all" | Status>((params.get("status") as Status) || "all");
  const [pay, setPay] = useState("all");
  const [page, setPage] = useState(1);
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => { setQ(params.get("q") ?? ""); setPage(1); }, [params]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    orders.forEach((o) => (c[o.status] = (c[o.status] ?? 0) + 1));
    return c;
  }, [orders]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return orders.filter((o) => (tab === "all" || o.status === tab) && (pay === "all" || o.payment === pay) && (!needle || [o.id, o.name, o.email, o.phone].some((v) => v.toLowerCase().includes(needle))));
  }, [orders, q, tab, pay]);

  const pages = Math.max(1, Math.ceil(rows.length / PER));
  const cur = Math.min(page, pages);
  const view = rows.slice((cur - 1) * PER, cur * PER);
  const allPicked = view.length > 0 && view.every((o) => picked.includes(o.id));

  function exportCsv() {
    const head = ["Order", "Date", "Customer", "Email", "Phone", "City", "Items", "Payment", "Status", "Total"];
    const body = rows.map((o) => [o.id, o.createdAt.slice(0, 10), o.name, o.email, o.phone, o.city, o.lines.map((l) => `${products[l.id].name} x${l.qty}`).join(" + "), o.payment, STATUS_LABEL[o.status], o.total]);
    download("mijab-orders.csv", [head, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n"));
  }

  return (
    <>
      <PageHeader title="Orders" sub={`${orders.length} orders in total`}>
        <button className="abtn ghost" onClick={exportCsv}><IDown size={15} /> Export CSV</button>
      </PageHeader>

      <div className="toolbar">
        <div className="tabs-a" role="tablist">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "on" : ""} onClick={() => { setTab(t); setPage(1); setPicked([]); }}>
              {t === "all" ? "All" : STATUS_LABEL[t]}<small>{counts[t] ?? 0}</small>
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <input className="ain" style={{ width: 240 }} placeholder="Search order, name, email" aria-label="Search orders" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <select className="asel" style={{ width: 190 }} aria-label="Payment method" value={pay} onChange={(e) => { setPay(e.target.value); setPage(1); }}>
          <option value="all">All payments</option><option>Cash on delivery</option><option>Debit or credit card</option><option>Bank transfer</option>
        </select>
      </div>

      <section className="acard">
        {picked.length > 0 && (
          <div className="bulk">
            <b>{picked.length} selected</b>
            <button className="abtn ghost sm" onClick={() => { setStatus(picked, "packed"); setPicked([]); }}>Mark packed</button>
            <button className="abtn ghost sm" onClick={() => { setStatus(picked, "out"); setPicked([]); }}>Mark out for delivery</button>
            <button className="abtn ghost sm" onClick={() => { setStatus(picked, "delivered"); setPicked([]); }}>Mark delivered</button>
            <button className="abtn danger sm" onClick={() => { setStatus(picked, "cancelled"); setPicked([]); }}>Cancel</button>
          </div>
        )}
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" aria-label="Select all on this page" checked={allPicked} onChange={() => setPicked(allPicked ? picked.filter((id) => !view.some((o) => o.id === id)) : [...new Set([...picked, ...view.map((o) => o.id)])])} /></th>
                <th>Order</th><th>Customer</th><th>Items</th><th>Payment</th><th>Status</th><th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {view.map((o) => (
                <tr key={o.id} className="link" onClick={() => router.push(`/admin/orders/${o.id}`)}>
                  <td onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label={`Select ${o.id}`} checked={picked.includes(o.id)} onChange={() => setPicked(picked.includes(o.id) ? picked.filter((x) => x !== o.id) : [...picked, o.id])} /></td>
                  <td className="id"><Link href={`/admin/orders/${o.id}`} onClick={(e) => e.stopPropagation()}>{o.id}</Link><span className="sub">{longDate(o.createdAt)}</span></td>
                  <td>{o.name}<span className="sub">{o.city.split(",")[0]}</span></td>
                  <td>
                    <div className="thumb-row">
                      {o.lines.slice(0, 3).map((l) => (<span className="thumb-s" key={l.id} style={{ background: products[l.id].swatch }}><Image src={products[l.id].image} alt={products[l.id].name} fill sizes="38px" /></span>))}
                    </div>
                  </td>
                  <td>{o.payment}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="num">{money(o.total)}</td>
                </tr>
              ))}
              {view.length === 0 && (<tr><td colSpan={7}><div className="empty-a">No orders match these filters.</div></td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="pager">
          <span>{rows.length ? `${(cur - 1) * PER + 1}–${Math.min(cur * PER, rows.length)} of ${rows.length}` : "0 results"}</span>
          <div>
            <button className="abtn ghost sm" disabled={cur <= 1} onClick={() => setPage(cur - 1)}>Previous</button>
            <button className="abtn ghost sm" disabled={cur >= pages} onClick={() => setPage(cur + 1)}>Next</button>
          </div>
        </div>
      </section>
    </>
  );
}

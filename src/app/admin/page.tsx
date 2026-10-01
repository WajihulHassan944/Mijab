"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BarChart, Donut, HBars } from "@/components/admin/Charts";
import { Card, PageHeader, Stat, StatusBadge } from "@/components/admin/UI";
import { IWarn } from "@/components/admin/AIcons";
import { byDay, inRange, live, pctChange, sum } from "@/lib/admin-calc";
import { STATUS_LABEL, Status, longDate, money, shortDate } from "@/lib/admin-data";
import { useAdmin } from "@/lib/admin-store";

export default function Dashboard() {
  const { orders, customers, products, messages, settings, today } = useAdmin();

  const d = useMemo(() => {
    const ok = live(orders);
    const cur = inRange(ok, today, 30);
    const prev = inRange(ok, today, 60, 30);
    const days = byDay(ok, today, 30);
    const sold: Record<string, number> = {};
    cur.forEach((o) => o.lines.forEach((l) => (sold[l.id] = (sold[l.id] ?? 0) + l.qty)));
    const status: Record<string, number> = {};
    orders.forEach((o) => (status[o.status] = (status[o.status] ?? 0) + 1));
    return { cur, prev, days, sold, status, revenue: sum(cur), prevRevenue: sum(prev) };
  }, [orders, customers, today]);

  const aov = d.cur.length ? d.revenue / d.cur.length : 0;
  const prevAov = d.prev.length ? d.prevRevenue / d.prev.length : 0;
  const newCustomers = customers.filter((c) => Date.parse(c.first) >= today.getTime() - 30 * 864e5).length;
  const low = products.filter((p) => p.active && p.stock <= settings.lowStockAt);
  const unread = messages.filter((m) => m.state === "unread");
  const toShip = orders.filter((o) => o.status === "placed" || o.status === "packed");

  return (
    <>
      <PageHeader title="Dashboard" sub={`Overview for the last 30 days · ${longDate(today.toISOString())}`}>
        <Link href="/admin/orders" className="abtn ghost">All orders</Link>
        <Link href="/admin/products" className="abtn">Manage products</Link>
      </PageHeader>

      <div className="agrid c4" style={{ marginBottom: 20 }}>
        <Stat label="Revenue" value={money(d.revenue)} delta={pctChange(d.revenue, d.prevRevenue)} hint="vs previous 30 days" />
        <Stat label="Orders" value={String(d.cur.length)} delta={pctChange(d.cur.length, d.prev.length)} hint="vs previous 30 days" />
        <Stat label="Average order" value={money(aov)} delta={pctChange(aov, prevAov)} hint="per order" />
        <Stat label="New customers" value={String(newCustomers)} hint={`${customers.length} in total`} />
      </div>

      <div className="cols" style={{ marginBottom: 20 }}>
        <Card title="Revenue" action={<span className="inline-note">Daily · last 30 days</span>}>
          <BarChart data={d.days.map((x) => ({ label: x.label, value: x.revenue, sub: `${x.label} · ${x.orders} order${x.orders === 1 ? "" : "s"}` }))} format={money} />
        </Card>
        <Card title="Orders by status">
          <Donut data={(["placed", "packed", "out", "delivered", "cancelled"] as Status[]).map((s) => ({ label: STATUS_LABEL[s], value: d.status[s] ?? 0 })).filter((x) => x.value)} />
        </Card>
      </div>

      <div className="cols wide" style={{ marginBottom: 20 }}>
        <Card title="Recent orders" action={<Link href="/admin/orders" className="inline-note" style={{ textDecoration: "underline" }}>View all</Link>} flush>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th className="num">Total</th></tr></thead>
              <tbody>
                {orders.slice(0, 7).map((o) => (
                  <tr key={o.id} className="link">
                    <td className="id"><Link href={`/admin/orders/${o.id}`}>{o.id}</Link><span className="sub">{shortDate(o.createdAt)}</span></td>
                    <td>{o.name}<span className="sub">{o.city.split(",")[0]}</span></td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className="num">{money(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="stack-a">
          <Card title="Needs attention">
            <ul className="alist" style={{ margin: "-18px -22px -22px" }}>
              <li><div className="grow"><div className="t">{toShip.length} orders to fulfil</div><div className="s">New or packed, not yet shipped</div></div><Link href="/admin/orders?status=placed" className="abtn ghost sm">Review</Link></li>
              <li><div className="grow"><div className="t">{unread.length} unread message{unread.length === 1 ? "" : "s"}</div><div className="s">From the contact form</div></div><Link href="/admin/messages" className="abtn ghost sm">Open</Link></li>
              {low.map((p) => (
                <li key={p.id}><IWarn size={18} stroke="#a4443b" /><div className="grow"><div className="t">{p.name} is low</div><div className="s low">{p.stock} left in stock</div></div><Link href={`/admin/products/${p.id}`} className="abtn ghost sm">Restock</Link></li>
              ))}
            </ul>
          </Card>
          <Card title="Top products">
            <HBars data={products.map((p) => ({ label: p.name, value: d.sold[p.id] ?? 0, sub: `${money((d.sold[p.id] ?? 0) * p.price)} in sales` })).sort((a, b) => b.value - a.value)} format={(n) => `${n} sold`} />
          </Card>
        </div>
      </div>
    </>
  );
}

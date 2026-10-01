"use client";

import { useMemo, useState } from "react";
import { BarChart, Donut, HBars, LineChart } from "@/components/admin/Charts";
import { Card, PageHeader, Stat } from "@/components/admin/UI";
import { byDay, inRange, live, pctChange, sum } from "@/lib/admin-calc";
import { money } from "@/lib/admin-data";
import { useAdmin } from "@/lib/admin-store";

const RANGES = [7, 30, 90] as const;

export default function AnalyticsPage() {
  const { orders, today } = useAdmin();
  const [range, setRange] = useState<(typeof RANGES)[number]>(30);

  const d = useMemo(() => {
    const ok = live(orders);
    const cur = inRange(ok, today, range);
    const prev = inRange(ok, today, range * 2, range);
    const days = byDay(ok, today, range);
    // revenue per product uses each line's own price-at-purchase, not the
    // current catalog price, so this stays accurate for past orders even
    // after an admin edits a product's price
    const prod: Record<string, { name: string; qty: number; revenue: number }> = {};
    cur.forEach((o) => o.lines.forEach((l) => { const p = (prod[l.id] ??= { name: l.name, qty: 0, revenue: 0 }); p.qty += l.qty; p.revenue += l.price * l.qty; }));
    const pay: Record<string, number> = {};
    const city: Record<string, number> = {};
    cur.forEach((o) => { pay[o.payment] = (pay[o.payment] ?? 0) + 1; const c = o.city.split(",")[0]; city[c] = (city[c] ?? 0) + o.total; });
    const seen = new Set<string>();
    ok.filter((o) => !cur.includes(o)).forEach((o) => seen.add(o.email.toLowerCase()));
    let returning = 0, fresh = 0;
    new Set(cur.map((o) => o.email.toLowerCase())).forEach((e) => (seen.has(e) ? returning++ : fresh++));
    const cancelled = inRange(orders, today, range).filter((o) => o.status === "cancelled").length;
    return { cur, prev, days, prod, pay, city, returning, fresh, cancelled };
  }, [orders, today, range]);

  const revenue = sum(d.cur);
  const visits = Math.round(d.cur.length * 41 + 120);
  const bags = Math.round(d.cur.length * 4.1);
  const checkouts = Math.round(d.cur.length * 1.7);

  return (
    <>
      <PageHeader title="Analytics" sub="How the store is performing">
        <div className="tabs-a">
          {RANGES.map((r) => (<button key={r} className={range === r ? "on" : ""} onClick={() => setRange(r)}>{r} days</button>))}
        </div>
      </PageHeader>

      <div className="agrid c4" style={{ marginBottom: 20 }}>
        <Stat label="Revenue" value={money(revenue)} delta={pctChange(revenue, sum(d.prev))} hint="vs previous period" />
        <Stat label="Orders" value={String(d.cur.length)} delta={pctChange(d.cur.length, d.prev.length)} hint="vs previous period" />
        <Stat label="Average order" value={money(d.cur.length ? revenue / d.cur.length : 0)} />
        <Stat label="Cancelled" value={String(d.cancelled)} hint={`${d.cur.length ? ((d.cancelled / (d.cur.length + d.cancelled)) * 100).toFixed(1) : 0}% of orders`} />
      </div>

      <div className="cols even" style={{ marginBottom: 20 }}>
        <Card title="Revenue over time"><LineChart data={d.days.map((x) => ({ label: x.label, value: x.revenue }))} format={money} /></Card>
        <Card title="Orders per day"><BarChart data={d.days.map((x) => ({ label: x.label, value: x.orders }))} format={(n) => `${n} order${n === 1 ? "" : "s"}`} /></Card>
      </div>

      <div className="cols even" style={{ marginBottom: 20 }}>
        <Card title="Sales by product"><HBars data={Object.values(d.prod).map((v) => ({ label: v.name, value: v.revenue, sub: `${v.qty} sold` })).sort((a, b) => b.value - a.value)} format={money} /></Card>
        <Card title="Revenue by city"><HBars data={Object.entries(d.city).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 6)} format={money} /></Card>
      </div>

      <div className="cols even">
        <Card title="Payment methods"><Donut data={Object.entries(d.pay).map(([label, value]) => ({ label, value }))} /></Card>
        <div className="stack-a">
          <Card title="Customers"><Donut size={140} data={[{ label: "New", value: d.fresh }, { label: "Returning", value: d.returning }]} /></Card>
          <Card title="Conversion funnel" action={<span className="inline-note">Estimated</span>}>
            <HBars data={[{ label: "Store visits", value: visits }, { label: "Added to bag", value: bags }, { label: "Reached checkout", value: checkouts }, { label: "Orders placed", value: d.cur.length }]} format={(n) => n.toLocaleString("en-US")} />
          </Card>
        </div>
      </div>
    </>
  );
}

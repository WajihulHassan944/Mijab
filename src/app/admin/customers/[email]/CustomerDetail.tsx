"use client";

import Link from "next/link";
import { Card, PageHeader, Stat, StatusBadge } from "@/components/admin/UI";
import { longDate, money } from "@/lib/admin-data";
import { useAdmin } from "@/lib/admin-store";

export function CustomerDetail({ email }: { email: string }) {
  const { customers, orders } = useAdmin();
  const c = customers.find((x) => x.email.toLowerCase() === email.toLowerCase());
  const mine = orders.filter((o) => o.email.toLowerCase() === email.toLowerCase());
  if (!c) return <PageHeader title="Customer not found" back={{ href: "/admin/customers", label: "Customers" }} />;
  const last = mine[0];

  return (
    <>
      <PageHeader title={c.name} sub={c.email} back={{ href: "/admin/customers", label: "Customers" }}>
        <a className="abtn ghost" href={`mailto:${c.email}`}>Email customer</a>
      </PageHeader>
      <div className="agrid c3" style={{ marginBottom: 20 }}>
        <Stat label="Orders" value={String(c.orders)} />
        <Stat label="Total spent" value={money(c.spent)} />
        <Stat label="Average order" value={money(c.orders ? c.spent / c.orders : 0)} />
      </div>
      <div className="cols">
        <Card title="Order history" flush>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Order</th><th>Date</th><th>Status</th><th className="num">Total</th></tr></thead>
              <tbody>
                {mine.map((o) => (
                  <tr key={o.id}><td className="id"><Link href={`/admin/orders/${o.id}`}>{o.id}</Link></td><td>{longDate(o.createdAt)}</td><td><StatusBadge status={o.status} /></td><td className="num">{money(o.total)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Contact">
          <dl className="kv-a">
            <dt>Phone</dt><dd>{c.phone}</dd>
            <dt>City</dt><dd>{c.city}</dd>
            <dt>Address</dt><dd>{last ? <>{last.address}<br />{last.city}</> : "—"}</dd>
            <dt>Customer since</dt><dd>{longDate(c.first)}</dd>
          </dl>
        </Card>
      </div>
    </>
  );
}

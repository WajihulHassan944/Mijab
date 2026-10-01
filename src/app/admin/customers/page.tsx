"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IDown } from "@/components/admin/AIcons";
import { Card, PageHeader, download } from "@/components/admin/UI";
import { longDate, money } from "@/lib/admin-data";
import { useAdmin } from "@/lib/admin-store";

export default function CustomersPage() {
  const { customers } = useAdmin();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"spent" | "orders" | "recent">("spent");
  const rows = useMemo(() => {
    const n = q.trim().toLowerCase();
    const list = customers.filter((c) => !n || [c.name, c.email, c.city].some((v) => v.toLowerCase().includes(n)));
    return [...list].sort((a, b) => (sort === "spent" ? b.spent - a.spent : sort === "orders" ? b.orders - a.orders : b.last.localeCompare(a.last)));
  }, [customers, q, sort]);

  return (
    <>
      <PageHeader title="Customers" sub={`${customers.length} customers · built from your orders`}>
        <button className="abtn ghost" onClick={() => download("mijab-customers.csv", ["Name,Email,Phone,City,Orders,Spent", ...rows.map((c) => [c.name, c.email, c.phone, c.city, c.orders, c.spent].map((x) => `"${x}"`).join(","))].join("\n"))}><IDown size={15} /> Export CSV</button>
      </PageHeader>
      <div className="toolbar">
        <input className="ain" style={{ maxWidth: 300 }} placeholder="Search name, email or city" aria-label="Search customers" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="asel" style={{ width: 200 }} aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
          <option value="spent">Top spenders</option><option value="orders">Most orders</option><option value="recent">Most recent</option>
        </select>
      </div>
      <Card flush>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Customer</th><th>City</th><th className="num">Orders</th><th className="num">Total spent</th><th>Last order</th><th>Segment</th></tr></thead>
            <tbody>
              {rows.slice(0, 50).map((c) => (
                <tr key={c.email}>
                  <td><Link href={`/admin/customers/${encodeURIComponent(c.email)}`} style={{ fontWeight: 500 }}>{c.name}</Link><span className="sub">{c.email}</span></td>
                  <td>{c.city}</td>
                  <td className="num">{c.orders}</td>
                  <td className="num">{money(c.spent)}</td>
                  <td>{longDate(c.last)}</td>
                  <td>{c.orders >= 3 || c.spent >= 10000 ? <span className="pill s-out">VIP</span> : c.orders > 1 ? <span className="pill s-delivered">Returning</span> : <span className="pill off">New</span>}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6}><div className="empty-a">No customers match.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

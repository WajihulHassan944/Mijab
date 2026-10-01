"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, PageHeader, Toggle } from "@/components/admin/UI";
import { live } from "@/lib/admin-calc";
import { money } from "@/lib/admin-data";
import { useAdmin } from "@/lib/admin-store";

export default function ProductsPage() {
  const { products, orders, updateProduct, settings } = useAdmin();
  const sold: Record<string, number> = {};
  live(orders).forEach((o) => o.lines.forEach((l) => (sold[l.id] = (sold[l.id] ?? 0) + l.qty)));

  return (
    <>
      <PageHeader title="Products" sub="Your catalogue and stock levels">
        <Link href="/shop" target="_blank" className="abtn ghost">View in store</Link>
      </PageHeader>
      <Card flush>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Product</th><th>SKU</th><th className="num">Price</th><th className="num">Stock</th><th className="num">Sold</th><th>Visible</th><th /></tr></thead>
            <tbody>
              {products.map((p) => {
                const low = p.stock <= settings.lowStockAt;
                return (
                  <tr key={p.id}>
                    <td><div className="cell-prod"><span className="thumb-s" style={{ background: p.swatch }}><Image src={p.image} alt={p.name} fill sizes="38px" /></span><div><Link href={`/admin/products/${p.id}`} style={{ fontWeight: 500 }}>{p.name}</Link><span className="sub">{p.audience} · Eau de Parfum 50 ml</span></div></div></td>
                    <td>{p.sku}</td>
                    <td className="num">{money(p.price)}{p.compareAt ? <span className="sub" style={{ textDecoration: "line-through" }}>{money(p.compareAt)}</span> : null}</td>
                    <td className="num">{p.stock === 0 ? <span className="pill s-cancelled">Out of stock</span> : <span className={low ? "low" : ""}>{p.stock}{low ? " · low" : ""}</span>}</td>
                    <td className="num">{sold[p.id] ?? 0}</td>
                    <td><Toggle on={p.active} onChange={(v) => updateProduct(p.id, { active: v })} label={`${p.name} visible in store`} /></td>
                    <td className="num"><Link href={`/admin/products/${p.id}`} className="abtn ghost sm">Edit</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="inline-note" style={{ marginTop: 14 }}>Price, stock and visibility changes apply storefront-wide immediately.</p>
    </>
  );
}

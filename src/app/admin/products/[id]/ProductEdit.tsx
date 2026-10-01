"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Card, PageHeader, Toggle } from "@/components/admin/UI";
import { AdminProduct } from "@/lib/admin-data";
import { useAdmin } from "@/lib/admin-store";

export function ProductEdit({ id }: { id: string }) {
  const { products, updateProduct } = useAdmin();
  const source = products.find((p) => p.id === id);
  const [f, setF] = useState<AdminProduct | null>(source ?? null);
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (source) setF(source); }, [source?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!source || !f) {
    return <PageHeader title="Product not found" back={{ href: "/admin/products", label: "Products" }} />;
  }
  const set = <K extends keyof AdminProduct>(k: K, v: AdminProduct[K]) => { setF({ ...f, [k]: v }); setSaved(false); };
  const num = (v: string) => (v === "" ? 0 : Math.max(0, Number(v) || 0));

  return (
    <>
      <PageHeader title={f.name} sub={`${f.sku} · ${f.audience}`} back={{ href: "/admin/products", label: "Products" }}>
        {saved && <span className="inline-note" style={{ alignSelf: "center" }}>Saved</span>}
        <button className="abtn" onClick={() => { updateProduct(f.id, f); setSaved(true); }}>Save changes</button>
      </PageHeader>

      <div className="cols">
        <div className="stack-a">
          <Card title="Details">
            <div className="agrid">
              <div className="afield"><label className="alabel" htmlFor="p-name">Name</label><input id="p-name" className="ain" value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
              <div className="afield"><label className="alabel" htmlFor="p-desc">Description</label><textarea id="p-desc" className="ata" rows={5} value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
            </div>
          </Card>
          <Card title="Scent notes">
            <div className="agrid c3">
              <div className="afield"><label className="alabel" htmlFor="n-top">Top</label><input id="n-top" className="ain" value={f.top} onChange={(e) => set("top", e.target.value)} /></div>
              <div className="afield"><label className="alabel" htmlFor="n-heart">Heart</label><input id="n-heart" className="ain" value={f.heart} onChange={(e) => set("heart", e.target.value)} /></div>
              <div className="afield"><label className="alabel" htmlFor="n-base">Base</label><input id="n-base" className="ain" value={f.base} onChange={(e) => set("base", e.target.value)} /></div>
            </div>
          </Card>
          <Card title="Pricing and stock">
            <div className="agrid c3">
              <div className="afield"><label className="alabel" htmlFor="p-price">Price (Rs.)</label><input id="p-price" className="ain" inputMode="numeric" value={f.price} onChange={(e) => set("price", num(e.target.value))} /></div>
              <div className="afield"><label className="alabel" htmlFor="p-cmp">Compare at (Rs.)</label><input id="p-cmp" className="ain" inputMode="numeric" value={f.compareAt ?? ""} onChange={(e) => set("compareAt", e.target.value ? num(e.target.value) : undefined)} /></div>
              <div className="afield"><label className="alabel" htmlFor="p-stock">In stock</label><input id="p-stock" className="ain" inputMode="numeric" value={f.stock} onChange={(e) => set("stock", num(e.target.value))} /></div>
            </div>
            <div className="agrid c2" style={{ marginTop: 16 }}>
              <div className="afield"><label className="alabel" htmlFor="p-sku">SKU</label><input id="p-sku" className="ain" value={f.sku} onChange={(e) => set("sku", e.target.value)} /></div>
            </div>
          </Card>
        </div>

        <div className="stack-a">
          <Card title="Preview">
            <div className="thumb-s" style={{ width: "100%", height: 260, background: f.swatch }}><Image src={f.image} alt={f.name} fill sizes="340px" /></div>
            <div className="setrow" style={{ marginTop: 16 }}>
              <div><b>Visible in store</b><small>Hidden products can&apos;t be bought</small></div>
              <Toggle on={f.active} onChange={(v) => set("active", v)} label="Visible in store" />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

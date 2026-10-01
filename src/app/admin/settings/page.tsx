"use client";

import { useEffect, useState } from "react";
import { Card, PageHeader, Toggle } from "@/components/admin/UI";
import { Settings } from "@/lib/admin-data";
import { useAdmin } from "@/lib/admin-store";

export default function SettingsPage() {
  const { settings, updateSettings, admin } = useAdmin();
  const [f, setF] = useState<Settings>(settings);
  const [saved, setSaved] = useState(false);
  useEffect(() => setF(settings), [settings]);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => { setF({ ...f, [k]: v }); setSaved(false); };
  const num = (v: string) => (v === "" ? 0 : Math.max(0, Number(v) || 0));

  return (
    <>
      <PageHeader title="Settings" sub="Store details, delivery, payments and alerts">
        {saved && <span className="inline-note" style={{ alignSelf: "center" }}>Saved</span>}
        <button className="abtn" onClick={() => { updateSettings(f); setSaved(true); }}>Save settings</button>
      </PageHeader>

      <div className="cols even">
        <div className="stack-a">
          <Card title="Store">
            <div className="agrid">
              <div className="afield"><label className="alabel" htmlFor="s-name">Store name</label><input id="s-name" className="ain" value={f.storeName} onChange={(e) => set("storeName", e.target.value)} /></div>
              <div className="afield"><label className="alabel" htmlFor="s-email">Contact email</label><input id="s-email" className="ain" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
              <div className="afield"><label className="alabel" htmlFor="s-phone">Phone</label><input id="s-phone" className="ain" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
            </div>
          </Card>
          <Card title="Delivery">
            <div className="agrid c2">
              <div className="afield"><label className="alabel" htmlFor="s-fee">Standard delivery (Rs.)</label><input id="s-fee" className="ain" inputMode="numeric" value={f.deliveryFee} onChange={(e) => set("deliveryFee", num(e.target.value))} /></div>
              <div className="afield"><label className="alabel" htmlFor="s-free">Free delivery over (Rs.)</label><input id="s-free" className="ain" inputMode="numeric" value={f.freeOver} onChange={(e) => set("freeOver", num(e.target.value))} /></div>
            </div>
            <p className="inline-note" style={{ marginTop: 10 }}>Set free delivery to 0 to always charge delivery.</p>
          </Card>
          <Card title="Account">
            <dl className="kv-a"><dt>Signed in as</dt><dd>{admin?.email}</dd><dt>Role</dt><dd>Owner</dd></dl>
          </Card>
        </div>

        <div className="stack-a">
          <Card title="Payment methods">
            <div className="setrow"><div><b>Cash on delivery</b><small>Pay when the order arrives</small></div><Toggle on={f.cod} onChange={(v) => set("cod", v)} label="Cash on delivery" /></div>
            <div className="setrow"><div><b>Debit or credit card</b><small>Visa, Mastercard</small></div><Toggle on={f.card} onChange={(v) => set("card", v)} label="Card payments" /></div>
            <div className="setrow"><div><b>Bank transfer</b><small>Details sent after the order</small></div><Toggle on={f.bank} onChange={(v) => set("bank", v)} label="Bank transfer" /></div>
          </Card>
          <Card title="Notifications">
            <div className="setrow"><div><b>New orders</b><small>Email me when an order is placed</small></div><Toggle on={f.notifyOrders} onChange={(v) => set("notifyOrders", v)} label="New order emails" /></div>
            <div className="setrow"><div><b>Low stock</b><small>Alert when a product runs low</small></div><Toggle on={f.notifyLowStock} onChange={(v) => set("notifyLowStock", v)} label="Low stock alerts" /></div>
            <div className="setrow"><div><b>Customer messages</b><small>Email me new contact form messages</small></div><Toggle on={f.notifyMessages} onChange={(v) => set("notifyMessages", v)} label="Message emails" /></div>
            <div className="afield" style={{ marginTop: 14 }}><label className="alabel" htmlFor="s-low">Low stock threshold (units)</label><input id="s-low" className="ain" inputMode="numeric" value={f.lowStockAt} onChange={(e) => set("lowStockAt", num(e.target.value))} /></div>
          </Card>
        </div>
      </div>
    </>
  );
}

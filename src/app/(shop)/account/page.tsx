"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Media } from "@/components/Media";
import { formatPrice } from "@/lib/products";
import { Catalog, Order, useStore } from "@/lib/store";

const status = ["Confirmed", "Packed", "Out for delivery", "Delivered"];
const bg = ["#EFE4DD", "#EFE4DD", "#DCCBE6", "#E4D3C6"];
type Tab = "orders" | "addresses" | "profile";

function OrderCard({ o, products }: { o: Order; products: Catalog }) {
  return (
    <div className="card order-card">
      <div className="head">
        <div><div className="id">Order {o.id}</div><div className="when">Placed {o.placedOn}</div></div>
        <span className="status" style={{ background: bg[o.stage] }}>{status[o.stage]}</span>
      </div>
      <div className="foot">
        <div className="th">{o.lines.map((l) => products[l.id] && <Media key={l.id} src={products[l.id].image} alt={l.name} bg={products[l.id].swatch} sizes="56px" />)}</div>
        <div className="acts">
          <div className="tot">{formatPrice(o.total)}</div>
          {o.stage < 3 && <Link className="btn sm" href={`/track?order=${o.id}`}>Track</Link>}
          <Link className="btn-outline sm" href={`/confirmation?order=${o.id}`}>Details</Link>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { user, ready, orders, signOut, updateUser, products } = useStore();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("orders");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (ready && !user) router.replace("/sign-in");
    if (user) { setName(user.name); setEmail(user.email); setAddress(user.address ?? ""); }
  }, [ready, user, router]);

  if (!user) return <div className="wrap" style={{ padding: "96px 0" }} />;

  const first = user.name.split(" ")[0];
  const latest = orders[0] as typeof orders[number] | undefined;
  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaved("");
    const res = await updateUser({ name: name.trim() || user.name, email: email.trim() || user.email });
    setSaved(res.ok ? "Profile updated." : res.error);
  };
  const saveAddress = async (e: FormEvent) => {
    e.preventDefault();
    setSaved("");
    const res = await updateUser({ address: address.trim() });
    setSaved(res.ok ? "Address saved." : res.error);
  };
  const go = (t: Tab) => { setTab(t); setSaved(""); };

  return (
    <div className="wrap">
      <section style={{ padding: "48px 0 28px" }}>
        <div className="eyebrow">My Account</div>
        <h1 className="h1" style={{ marginTop: 12, fontSize: 56 }}>Hello, {first}</h1>
      </section>
      <section className="acct">
        <nav className="acct-nav" aria-label="Account">
          <button className={tab === "orders" ? "on" : ""} onClick={() => go("orders")}>Orders</button>
          <button className={tab === "addresses" ? "on" : ""} onClick={() => go("addresses")}>Addresses</button>
          <button className={tab === "profile" ? "on" : ""} onClick={() => go("profile")}>Profile details</button>
          <Link href="/track">Track an order</Link>
          <button onClick={() => { signOut(); router.push("/sign-in"); }}>Sign out</button>
        </nav>

        <div className="acct-main">
          {tab === "orders" && (
            <>
              <div className="form-title" style={{ marginBottom: 0 }}>Your orders</div>
              {orders.length === 0 && (
                <div className="card" style={{ fontSize: 14, fontWeight: 300 }}>
                  No orders yet. <Link href="/shop" style={{ textDecoration: "underline" }}>Start shopping</Link>.
                </div>
              )}
              {orders.map((o) => <OrderCard key={o.id} o={o} products={products} />)}
              <div className="form-title" style={{ margin: "16px 0 0" }}>Saved address</div>
              <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.65 }}>
                  {user.address ? user.address : latest ? <>{latest.name}<br />{latest.address}<br />{latest.city}</> : "No address saved yet."}
                </div>
                <button className="link-arrow" style={{ minHeight: 44 }} onClick={() => go("addresses")}>Edit</button>
              </div>
            </>
          )}
          {tab === "addresses" && (
            <form className="stack" onSubmit={saveAddress} style={{ maxWidth: 520 }}>
              <div className="form-title" style={{ marginBottom: 0 }}>Saved address</div>
              <div className="field"><label htmlFor="a-addr">Address</label><textarea id="a-addr" className="textarea" rows={4} value={address} placeholder={latest ? `${latest.name}\n${latest.address}\n${latest.city}` : "House, street, city"} onChange={(e) => setAddress(e.target.value)} /></div>
              <button className="btn fit" style={{ width: 200 }}>Save address</button>
              {saved && <div className="sent" role="status">{saved}</div>}
            </form>
          )}
          {tab === "profile" && (
            <form className="stack" onSubmit={saveProfile} style={{ maxWidth: 520 }}>
              <div className="form-title" style={{ marginBottom: 0 }}>Profile details</div>
              <div className="field"><label htmlFor="p-name">Full name</label><input id="p-name" className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="field"><label htmlFor="p-email">Email</label><input id="p-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <button className="btn fit" style={{ width: 200 }}>Save changes</button>
              {saved && <div className="sent" role="status">{saved}</div>}
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

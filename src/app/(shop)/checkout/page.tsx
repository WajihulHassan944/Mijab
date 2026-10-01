"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Arrow } from "@/components/Icons";
import { ProductMedia } from "@/components/Media";
import { SummaryRows } from "@/components/Summary";
import { formatPrice, products } from "@/lib/products";
import { useStore } from "@/lib/store";

const PAYMENTS = [
  { id: "Cash on delivery", sub: "Pay when your order arrives" },
  { id: "Debit or credit card", sub: "Visa, Mastercard" },
  { id: "Bank transfer", sub: "Details sent after you place the order" },
];

type Form = Record<"email" | "phone" | "first" | "last" | "address" | "apt" | "city" | "province" | "postal", string>;
const blank: Form = { email: "", phone: "", first: "", last: "", address: "", apt: "", city: "", province: "", postal: "" };

function Field({ id, label, value, onChange, error, type = "text", placeholder = "", flex }: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string; type?: string; placeholder?: string; flex?: number }) {
  return (
    <div className="field" style={flex ? { flex } : undefined}>
      <label htmlFor={id}>{label}</label>
      <input id={id} className={`input${error ? " err" : ""}`} type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} />
      {error && <div id={`${id}-err`} className="err-text">{error}</div>}
    </div>
  );
}

export default function CheckoutPage() {
  const { cart, totals, promo, user, placeOrder, ready } = useStore();
  const router = useRouter();
  const [f, setF] = useState<Form>(blank);
  const [pay, setPay] = useState(PAYMENTS[0].id);
  const [errors, setErrors] = useState<Partial<Form>>({});
  const [submitError, setSubmitError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      const [first = "", ...rest] = user.name.split(" ");
      setF((cur) => ({ ...cur, email: cur.email || user.email, first: cur.first || first, last: cur.last || rest.join(" ") }));
    }
  }, [user]);

  const set = (k: keyof Form) => (v: string) => setF((cur) => ({ ...cur, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitError("");
    const err: Partial<Form> = {};
    if (!/^\S+@\S+\.\S+$/.test(f.email)) err.email = "Enter a valid email address.";
    if (f.phone.replace(/\D/g, "").length < 10) err.phone = "Enter a phone number with at least 10 digits.";
    (["first", "last", "address", "city", "province", "postal"] as const).forEach((k) => { if (!f[k].trim()) err[k] = "Required"; });
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById("checkout-form")?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      return;
    }
    setBusy(true);
    const result = await placeOrder({
      name: `${f.first.trim()} ${f.last.trim()}`,
      address: [f.address.trim(), f.apt.trim()].filter(Boolean).join(", "),
      city: [f.city.trim(), f.province.trim()].filter(Boolean).join(", "),
      email: f.email.trim(),
      phone: f.phone.trim(),
      payment: pay,
    });
    setBusy(false);
    if (!result.ok) return setSubmitError(result.error);
    router.push(`/confirmation?order=${result.order.id}`);
  }

  if (ready && cart.length === 0) {
    return (
      <div className="wrap empty">
        <div className="eyebrow">Checkout</div>
        <h1 className="h1" style={{ margin: "12px 0 14px" }}>Nothing to check out</h1>
        <p className="lead" style={{ marginBottom: 28 }}>Add a fragrance to your bag first.</p>
        <Link href="/shop" className="btn" style={{ display: "inline-flex", width: 240 }}>Shop MIJAB</Link>
      </div>
    );
  }

  return (
    <div className="wrap">
      <section style={{ padding: "44px 0 20px" }}>
        <div className="crumbs">
          <Link href="/bag">Bag</Link><Arrow stroke="#B08F84" w={12} />
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>Details</span><Arrow stroke="#B08F84" w={12} />
          <span>Confirmation</span>
        </div>
        <h1 className="h1" style={{ marginTop: 16, fontSize: 56 }}>Checkout</h1>
      </section>

      <section className="layout-2" style={{ padding: "8px 0 64px" }}>
        <form id="checkout-form" className="main checkout-form" onSubmit={submit} noValidate>
          <div>
            <div className="form-title">Contact</div>
            <div className="stack">
              <Field id="f-email" label="Email" type="email" placeholder="you@example.com" value={f.email} onChange={set("email")} error={errors.email} />
              <Field id="f-phone" label="Phone" type="tel" placeholder="03xx xxxxxxx" value={f.phone} onChange={set("phone")} error={errors.phone} />
            </div>
          </div>
          <div>
            <div className="form-title">Delivery address</div>
            <div className="stack">
              <div className="row">
                <Field id="f-first" label="First name" value={f.first} onChange={set("first")} error={errors.first} />
                <Field id="f-last" label="Last name" value={f.last} onChange={set("last")} error={errors.last} />
              </div>
              <Field id="f-address" label="Address" placeholder="House, street, area" value={f.address} onChange={set("address")} error={errors.address} />
              <Field id="f-apt" label="Apartment or landmark (optional)" value={f.apt} onChange={set("apt")} />
              <div className="row">
                <Field id="f-city" label="City" value={f.city} onChange={set("city")} error={errors.city} />
                <Field id="f-province" label="Province" value={f.province} onChange={set("province")} error={errors.province} />
                <Field id="f-postal" label="Postal code" value={f.postal} onChange={set("postal")} error={errors.postal} flex={0.7} />
              </div>
            </div>
          </div>
          <div>
            <div className="form-title">Delivery method</div>
            <label className="radio on">
              <input type="radio" name="ship" defaultChecked />
              <span style={{ flex: 1 }}><b>Standard delivery</b><small>Rs. 200</small></span>
            </label>
          </div>
          <div>
            <div className="form-title">Payment</div>
            <div className="stack" style={{ gap: 10 }}>
              {PAYMENTS.map((p) => (
                <label key={p.id} className={`radio${pay === p.id ? " on" : ""}`}>
                  <input type="radio" name="pay" checked={pay === p.id} onChange={() => setPay(p.id)} />
                  <span style={{ flex: 1 }}><b>{p.id}</b><small>{p.sub}</small></span>
                </label>
              ))}
            </div>
          </div>
        </form>

        <aside className="summary">
          <h2>Your order</h2>
          <div style={{ marginTop: 8 }}>
            {cart.map((l) => (
              <div className="mini-line" key={l.id}>
                <ProductMedia product={products[l.id]} sizes="56px" />
                <div>
                  <div className="n">{products[l.id].name}</div>
                  <div className="q">Qty {l.qty}</div>
                </div>
                <div className="p">{formatPrice(products[l.id].price * l.qty)}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}><SummaryRows {...totals} promo={promo} /></div>
          {submitError && <div className="err-text" role="alert" style={{ marginTop: 12 }}>{submitError}</div>}
          <button type="submit" form="checkout-form" className="btn" style={{ marginTop: 20 }} disabled={busy}>{busy ? "Placing order…" : "Place order"} <Arrow stroke="#F6EAE2" /></button>
          <Link href="/bag" className="link-arrow" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>Return to bag</Link>
        </aside>
      </section>
    </div>
  );
}

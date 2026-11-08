"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, Suspense, useState } from "react";
import { Arrow, Check } from "@/components/Icons";
import { api, ApiError } from "@/lib/api";
import { BANK } from "@/lib/bank";

export default function PaymentProofPage() {
  return (
    <Suspense>
      <PaymentProofForm />
    </Suspense>
  );
}

function PaymentProofForm() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("order") ?? "";
  const phone = params.get("phone") ?? "";

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setError("");
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file) return setError("Choose a screenshot of your bank transfer first.");
    setBusy(true);
    setError("");
    try {
      await api.orders.uploadPaymentProof(orderId, phone, file);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not upload your screenshot. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!orderId) {
    return (
      <div className="wrap empty">
        <div className="eyebrow">Payment proof</div>
        <h1 className="h1" style={{ margin: "12px 0 14px" }}>Missing order details</h1>
        <p className="lead" style={{ marginBottom: 28 }}>Track your order to upload a payment screenshot instead.</p>
        <Link href="/track" className="btn" style={{ display: "inline-flex", width: 240 }}>Track an order</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="wrap">
        <section className="confirm-head">
          <div className="ok"><Check size={30} /></div>
          <div className="eyebrow">Order {orderId}</div>
          <h1 className="h1">Screenshot received</h1>
          <p>We&apos;ll confirm your payment shortly. You&apos;ll get an email once it&apos;s verified.</p>
        </section>
        <section className="cta-pair" style={{ marginBottom: 72 }}>
          <Link href={`/confirmation?order=${orderId}`} className="btn">View order confirmation <Arrow stroke="#F6EAE2" /></Link>
          <Link href="/shop" className="btn-outline">Continue shopping <Arrow stroke="#2A1D18" /></Link>
        </section>
      </div>
    );
  }

  return (
    <div className="wrap">
      <section style={{ padding: "48px 0 20px" }}>
        <div className="eyebrow">Order {orderId}</div>
        <h1 className="h1" style={{ marginTop: 14, fontSize: 48 }}>Upload your payment screenshot</h1>
        <p className="lead" style={{ marginTop: 16, maxWidth: 480 }}>
          Send your payment by bank transfer, then upload a screenshot of the transfer so we can confirm your order.
        </p>
      </section>

      <div className="card" style={{ maxWidth: 480, fontSize: 14, fontWeight: 300, lineHeight: 1.7, marginBottom: 28 }}>
        <div style={{ fontWeight: 500, marginBottom: 6 }}>Send payment by bank transfer</div>
        <div>Bank: <b>{BANK.name}</b></div>
        <div>Account number: <b>{BANK.account}</b></div>
        <div>Account title: <b>{BANK.title}</b></div>
      </div>

      <form onSubmit={submit} className="stack" style={{ maxWidth: 480, marginBottom: 72 }}>
        <div className="field">
          <label htmlFor="proof-file">Payment screenshot</label>
          <input id="proof-file" className="input" type="file" accept="image/jpeg,image/png,image/webp" onChange={onPick} />
        </div>
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Payment screenshot preview" style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid #eee" }} />
        )}
        {error && <div className="err-text" role="alert">{error}</div>}
        <button type="submit" className="btn" disabled={busy}>{busy ? "Uploading…" : "Submit screenshot"} <Arrow stroke="#F6EAE2" /></button>
        <Link href={`/confirmation?order=${orderId}`} className="link-arrow" style={{ justifyContent: "center" }}>
          I&apos;ll do this later
        </Link>
      </form>
    </div>
  );
}

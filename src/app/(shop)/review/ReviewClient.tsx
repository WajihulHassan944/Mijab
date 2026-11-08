"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Arrow, Check } from "@/components/Icons";
import { api, ApiError } from "@/lib/api";

type Step = "lookup" | "write" | "done";

export function ReviewClient() {
  const params = useSearchParams();
  const [step, setStep] = useState<Step>("lookup");
  const [orderId, setOrderId] = useState(params.get("order") ?? "");
  const [phone, setPhone] = useState(params.get("phone") ?? "");
  const [name, setName] = useState("");
  const [products, setProducts] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function lookup(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api.reviews.eligibility(orderId.trim(), phone.trim());
      if (res.reason === "reviewed") setError("You've already reviewed this order — thank you!");
      else if (res.reason === "not_delivered") setError("You can leave a review once your order has been delivered. We'll email you a link when it arrives.");
      else {
        setName(res.name);
        setProducts(res.products);
        setStep("write");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!rating) return setError("Please choose a star rating.");
    if (body.trim().length < 10) return setError("Please write at least a few words.");
    setError("");
    setBusy(true);
    try {
      await api.reviews.submit({ orderId: orderId.trim(), phone: phone.trim(), rating, body: body.trim(), name: name.trim() || undefined });
      setStep("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send your review. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (step === "done") {
    return (
      <div className="wrap">
        <section className="confirm-head">
          <div className="ok"><Check size={30} /></div>
          <div className="eyebrow">Order {orderId.toUpperCase()}</div>
          <h1 className="h1">Thank you</h1>
          <p>Your review has been received. It will appear on our site once our team has had a look.</p>
        </section>
        <section className="cta-pair" style={{ marginBottom: 72 }}>
          <Link href="/shop" className="btn">Continue shopping <Arrow stroke="#F6EAE2" /></Link>
          <Link href="/" className="btn-outline">Back to home <Arrow stroke="#2A1D18" /></Link>
        </section>
      </div>
    );
  }

  const shown = hover || rating;

  return (
    <div className="wrap">
      <section style={{ padding: "56px 0 28px" }}>
        <div className="eyebrow">Your review</div>
        <h1 className="h1" style={{ marginTop: 14 }}>How was your MIJAB?</h1>
        <p className="lead" style={{ marginTop: 16, maxWidth: 480 }}>
          {step === "lookup"
            ? "Enter your order number and the phone number you used at checkout."
            : `Reviewing order ${orderId.toUpperCase()}${products.length ? ` · ${products.join(", ")}` : ""}`}
        </p>
      </section>

      {step === "lookup" ? (
        <form className="track-form" onSubmit={lookup}>
          <div className="field">
            <label htmlFor="r-order">Order number</label>
            <input id="r-order" className="input" placeholder="MJB-10482" value={orderId} onChange={(e) => setOrderId(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="r-phone">Phone number</label>
            <input id="r-phone" className="input" type="tel" placeholder="03xx xxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <button className="btn" type="submit" disabled={busy}>{busy ? "Checking…" : "Continue"} <Arrow stroke="#F6EAE2" /></button>
        </form>
      ) : (
        <form className="stack review-form" onSubmit={submit} noValidate>
          <div className="field">
            <label id="r-rating-label">Your rating</label>
            <div className="star-pick" role="radiogroup" aria-labelledby="r-rating-label" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  className={n <= shown ? "on" : ""}
                  onMouseEnter={() => setHover(n)}
                  onClick={() => setRating(n)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="r-body">Your review</label>
            <textarea id="r-body" className="textarea" rows={5} maxLength={1000} placeholder="What did you love about it? How long does it last?" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="r-name">Name to show</label>
            <input id="r-name" className="input" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
          </div>
          {error && <div className="err-text" role="alert">{error}</div>}
          <button type="submit" className="btn" disabled={busy}>{busy ? "Sending…" : "Submit review"} <Arrow stroke="#F6EAE2" /></button>
        </form>
      )}

      {step === "lookup" && error && (
        <div className="card" style={{ marginBottom: 72 }} role="alert">{error}</div>
      )}
    </div>
  );
}

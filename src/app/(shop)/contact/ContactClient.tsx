"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { Arrow, Instagram, Mail } from "@/components/Icons";
import { CONTACT_EMAIL, CONTACT_PHONE, INSTAGRAM_URL } from "@/lib/site";
import { api, ApiError } from "@/lib/api";

const WHATSAPP = `https://wa.me/${CONTACT_PHONE.replace(/\D/g, "")}`;

const faqs = [
  ["How do I choose a fragrance?", "Café Noir is deep and warm, made for him. Vanilla Gourmand is soft and sweet, made for her. Many people take The Duo, and the alcohol-free Perfume Wax is a lovely everyday or travel companion."],
  ["Do you offer Cash on Delivery?", "Yes. Cash on delivery is available across Pakistan; you'll see all payment options at checkout."],
  ["How long does delivery take?", "We deliver across Pakistan in 2–4 working days. Delivery cost and options are shown at checkout."],
  ["Can I send it as a gift?", "Every order arrives gift-ready in a signature MIJAB bag: pink for her, black for him, and the Perfume Wax in its own windowed gift bag."],
  ["How do I use the Perfume Wax?", "Touch the wax lightly with a fingertip and press it onto your wrists, neck and behind the ears. It is alcohol-free and mess-free, so you can top up through the day."],
  ["How should I store my perfume?", "Keep it somewhere cool and dry, away from direct sunlight and heat, with the cap on."],
  ["How can I track my order?", "Open Track Order and enter your order number with the phone number you used at checkout."],
  ["Returns", "For hygiene reasons we can't accept returns on opened perfume. If your order arrives damaged or isn't what you ordered, send us a message and we'll put it right."],
];

function WhatsAppIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden>
      <path d="M4 20l1.2-3.6A8 8 0 1112 20a8 8 0 01-3.9-1L4 20z" />
      <path d="M9 8.5c0 3 2.5 6 6 6.5l1-1.4-1.8-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-1.8L9 8.5z" />
    </svg>
  );
}

export function ContactClient() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await api.contact.submit({
        name: String(f.get("name") ?? ""),
        email: String(f.get("email") ?? ""),
        subject: String(f.get("subject") ?? ""),
        body: String(f.get("message") ?? ""),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send your message. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="lx">
      <section className="lx-phero">
        <Image src="/images/contact/banner.jpg" alt="" fill priority sizes="100vw" className="lx-phero-img" />
        <div className="lx-phero-shade" />
        <div className="lx-wrap lx-phero-copy">
          <div className="lx-eyebrow gold lined">Get in Touch</div>
          <h1>We&apos;d love to hear <em>from you</em></h1>
          <p>Have a question, feedback or need help with your order? We&apos;re here for you.</p>
        </div>
      </section>

      <div className="lx-wrap lc-grid">
        <section className="lx-panel lc-form">
          <h2>Send us a Message</h2>
          {sent ? (
            <div className="lc-sent" role="status">
              Thank you, your message is on its way to the MIJAB team. We&apos;ll reply by email.
              <button type="button" className="lx-textlink" onClick={() => setSent(false)}>Send another <Arrow /></button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="lc-row">
                <label className="lx-field"><span>Name <i>*</i></span><input name="name" required autoComplete="name" /></label>
                <label className="lx-field"><span>Email <i>*</i></span><input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label>
              </div>
              <label className="lx-field">
                <span>Subject <i>*</i></span>
                <select name="subject" defaultValue="Question about an order">
                  <option>Question about an order</option>
                  <option>Product advice</option>
                  <option>Wholesale or gifting</option>
                  <option>Something else</option>
                </select>
              </label>
              <label className="lx-field"><span>Message <i>*</i></span><textarea name="message" rows={5} required placeholder="Type your message here…" /></label>
              {error && <div className="lx-err" role="alert">{error}</div>}
              <button className="lx-btn dark lc-send" disabled={busy}>{busy ? "Sending…" : "Send Message"} <Arrow /></button>
            </form>
          )}
        </section>

        <aside className="lx-panel lc-side">
          <a href={`mailto:${CONTACT_EMAIL}`} className="lc-way"><Mail size={30} stroke="currentColor" width={1.1} /><span><b>Email Us</b>{CONTACT_EMAIL}</span></a>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="lc-way"><WhatsAppIcon /><span><b>Chat on WhatsApp</b>{CONTACT_PHONE}</span></a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="lc-way"><Instagram size={30} stroke="currentColor" width={1.1} /><span><b>Follow Us on Instagram</b>See new launches first</span></a>
          <div className="lc-side-img"><Image src="/images/home/story.jpg" alt="" fill sizes="340px" /></div>
        </aside>
      </div>

      <section className="lx-wrap lc-faq" id="faq">
        <div className="lc-faq-head">
          <div className="lx-eyebrow gold lined">FAQ</div>
          <h2>Frequently Asked <em>Questions</em></h2>
        </div>
        <div className="lc-faq-list">
          {faqs.map(([q, a], i) => (
            <details key={q} open={i === 0}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

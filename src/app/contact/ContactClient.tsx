"use client";

import { FormEvent, useState } from "react";
import { Arrow, ChevronDown, Facebook, Instagram, Mail, TikTok } from "@/components/Icons";

const faqs = [
  ["How do I choose a fragrance?", "Café Noir is deep and warm, made for him. Vanilla Gourmand is soft and sweet, made for her. Many people take the Duo."],
  ["How should I store my perfume?", "Keep it somewhere cool and dry, away from direct sunlight and heat, with the cap on."],
  ["Do you offer gift wrapping?", "Every order arrives in a signature MIJAB bag: pink for her, black for him."],
  ["How can I track my order?", "Open Track order and enter your order number with the phone number you used at checkout."],
  ["Delivery and returns", "Delivery cost and options are shown at checkout. If something isn't right, send us a message and we'll help."],
];

export function ContactClient() {
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState<number | null>(0);

  function submit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <>
      <div className="wrap">
        <section style={{ padding: "56px 0 36px" }}>
          <div className="eyebrow">Contact</div>
          <h1 className="h1" style={{ marginTop: 14, fontSize: 60 }}>We would love to hear from you.</h1>
        </section>
        <section className="contact-grid">
          {sent ? (
            <div style={{ flex: 1 }} className="sent" role="status">
              Thank you — your message is on its way to the MIJAB team. We&apos;ll reply by email.
              <div><button className="link-arrow" onClick={() => setSent(false)}>Send another</button></div>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="row">
                <div className="field"><label htmlFor="c-name">Name</label><input id="c-name" className="input" required /></div>
                <div className="field"><label htmlFor="c-email">Email</label><input id="c-email" className="input" type="email" placeholder="you@example.com" required /></div>
              </div>
              <div className="field">
                <label htmlFor="c-sub">Subject</label>
                <select id="c-sub" className="select"><option>Question about an order</option><option>Product advice</option><option>Wholesale or gifting</option><option>Something else</option></select>
              </div>
              <div className="field"><label htmlFor="c-msg">Message</label><textarea id="c-msg" className="textarea" rows={6} required /></div>
              <button className="btn" style={{ width: 220 }}>Send message <Arrow stroke="#F6EAE2" /></button>
            </form>
          )}
          <aside>
            <h2>Get in touch</h2>
            <div style={{ marginTop: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Mail size={20} />
              <div><div className="eyebrow">Email</div><div style={{ marginTop: 4, fontSize: 14, fontWeight: 300 }}>hello@mijab.com</div></div>
            </div>
            <div className="eyebrow" style={{ marginTop: 20 }}>Follow</div>
            <div className="socials" style={{ marginTop: 8, marginLeft: -12 }}>
              <a href="#" aria-label="Instagram"><Instagram stroke="#2A1D18" /></a>
              <a href="#" aria-label="TikTok"><TikTok stroke="#2A1D18" /></a>
              <a href="#" aria-label="Facebook"><Facebook stroke="#2A1D18" /></a>
            </div>
          </aside>
        </section>
      </div>

      <section className="faq">
        <div className="wrap">
          <div className="eyebrow">FAQ</div>
          <h2>Good to know</h2>
          {faqs.map(([q, a], i) => (
            <div className={`faq-item${open === i ? " open" : ""}`} key={q}>
              <button aria-expanded={open === i} aria-controls={`faq-${i}`} onClick={() => setOpen(open === i ? null : i)}>
                {q}
                <ChevronDown size={22} stroke="#2A1D18" />
              </button>
              {open === i && <div className="a" id={`faq-${i}`}>{a}</div>}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

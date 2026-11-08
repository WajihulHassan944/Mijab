"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";
import { formatPrice, Product, ProductId } from "@/lib/products";
import { useStore } from "@/lib/store";
import { AddToBag } from "./Buttons";
import { Arrow, Diamond, Heart, ShieldCheck, Headset, Sparkle, Truck } from "./Icons";

/** Delivery wording that follows the live store settings (fee and cash on delivery). */
function useDelivery() {
  const { settings } = useStore();
  return { cod: settings.cod, fee: formatPrice(settings.deliveryFee) };
}

export function AnnounceBar() {
  const { cod, fee } = useDelivery();
  return (
    <Link href="/shop" className="mh-announce only-mobile">
      <Sparkle size={13} color="#e9b2a6" />
      <span>{cod ? "Cash on Delivery Across Pakistan" : `Delivery Across Pakistan · ${fee}`}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f6eae2" strokeWidth="1.6" aria-hidden><path d="M9 5l7 7-7 7" /></svg>
    </Link>
  );
}

/** Slow ticker of store promises under the collection. */
export function PromiseTicker() {
  const { cod, fee } = useDelivery();
  const items = [cod && "Cash on Delivery", `${fee} Delivery Across Pakistan`, "Gift-Ready Packaging", "Long-Lasting Eau de Parfum"].filter(Boolean) as string[];
  const row = (hidden?: boolean) => (
    <ul className="mh-ticker-row" aria-hidden={hidden || undefined}>
      {items.map((t) => (
        <li key={t}><Sparkle size={9} color="#e9b2a6" />{t}</li>
      ))}
    </ul>
  );
  return (
    <div className="mh-ticker only-mobile" aria-label="Our promises">
      <div className="mh-ticker-track">{row()}{row(true)}</div>
    </div>
  );
}

export function TrustStrip() {
  const { cod, fee } = useDelivery();
  return (
    <section className="mh-trust only-mobile mh-reveal" aria-label="Why shop with MIJAB">
      {cod ? (
        <div><Truck size={26} width={1.4} /><b>Cash on Delivery</b><span>Pay at Your Door</span></div>
      ) : (
        <div><Truck size={26} width={1.4} /><b>Nationwide Delivery</b><span>{fee} Anywhere</span></div>
      )}
      <div><ShieldCheck size={26} width={1.4} /><b>Secure Checkout</b><span>Shop with Confidence</span></div>
      <div><Headset size={26} width={1.4} /><b>Friendly Support</b><span>We&apos;re Here to Help</span></div>
    </section>
  );
}

/** Round "+" on a product card: adds one to the bag without leaving the page. */
export function QuickAdd({ id, name }: { id: ProductId; name: string }) {
  const { add } = useStore();
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1600);
    return () => clearTimeout(t);
  }, [done]);
  return (
    <button
      type="button"
      className={`mh-quick${done ? " done" : ""}`}
      aria-label={done ? `${name} added to bag` : `Add ${name} to bag`}
      onClick={() => { add(id, 1); setDone(true); }}
    >
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {done ? (
          <path d="M6 12.5l4 4L18 8.5" strokeWidth="1.8" />
        ) : (
          <>
            <path d="M5 8h14l-1 12H6L5 8z" />
            <path d="M9 8V6.5a3 3 0 016 0V8" />
            <path d="M12 11.5v5M9.5 14h5" />
          </>
        )}
      </svg>
      <span className="sr-only" aria-live="polite">{done ? "Added to bag" : ""}</span>
    </button>
  );
}

const NOTE_ROWS = [
  { key: "top", label: "Top", hint: "The first impression", icon: <Sparkle size={14} color="#f2c6bc" /> },
  { key: "heart", label: "Heart", hint: "The soul of the scent", icon: <Heart size={16} stroke="#f2c6bc" width={1.4} /> },
  { key: "base", label: "Base", hint: "What lingers on skin", icon: <Diamond size={16} stroke="#f2c6bc" width={1.4} /> },
] as const;

/** Scent notes with a For Him / For Her switch, over the dark silk photograph. */
export function ScentNotes({ fragrances }: { fragrances: Product[] }) {
  const list = fragrances.filter((f) => f.notes);
  const [pick, setPick] = useState(0);
  if (!list.length) return null;
  const p = list[Math.min(pick, list.length - 1)];
  return (
    <section className="mh-notes only-mobile" aria-labelledby="mh-notes-title">
      <Image className="mh-notes-bg" src="/images/m-home/notes-bg.jpg" alt="" fill sizes="100vw" />
      <div className="mh-reveal">
        <div className="mh-eyebrow light"><span>The Scent Notes</span></div>
        <h2 className="mh-title light" id="mh-notes-title">Two Stories, Told in Notes</h2>
        <div className="mh-switch" role="tablist" aria-label="Choose fragrance" style={{ ["--n" as string]: list.length, ["--i" as string]: pick }}>
          <span className="mh-switch-thumb" aria-hidden />
          {list.map((f, k) => (
            <button key={f.id} type="button" role="tab" aria-selected={k === pick} aria-controls="mh-notes-panel" className={k === pick ? "on" : ""} onClick={() => setPick(k)}>
              {f.audience}
            </button>
          ))}
        </div>
        <div className="mh-notes-panel" id="mh-notes-panel" role="tabpanel" key={p.id}>
          <div className="mh-notes-head">
            <div className="mh-notes-disc"><Image src={p.image} alt={`MIJAB ${p.name}`} fill sizes="72px" /></div>
            <div>
              <b>{p.name}</b>
              <span>{p.tagline}</span>
            </div>
          </div>
          {NOTE_ROWS.map(({ key, label, hint, icon }, k) => (
            <div className="mh-note" key={key} style={{ animationDelay: `${80 + k * 90}ms` }}>
              <span className="mh-note-ico">{icon}</span>
              <span className="mh-note-k">{label}<small>{hint}</small></span>
              <span className="mh-note-v">{p.notes![key]}</span>
            </div>
          ))}
          <Link href={`/product/${p.slug}`} className="mh-pill ghost">Discover {p.name} <Arrow stroke="#F6EAE2" w={13} /></Link>
        </div>
      </div>
    </section>
  );
}

type Who = "him" | "her" | "both";
type Mood = "bold" | "soft";

/** Two-tap fragrance finder that ends on a product with add-to-bag. */
export function ScentQuiz({ catalog }: { catalog: Record<string, Product> }) {
  const [who, setWho] = useState<Who | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const step = who === null ? 1 : who === "both" || mood !== null ? 3 : 2;
  const resultId: ProductId | null = step < 3 ? null : who === "both" ? "duo" : mood === "bold" ? "cafe-noir" : "vanilla-gourmand";
  const result = resultId ? catalog[resultId] : null;
  const reset = () => { setWho(null); setMood(null); };

  return (
    <section className="mh-quiz only-mobile mh-reveal" aria-labelledby="mh-quiz-title">
      <div className="mh-eyebrow"><span>Find Your Scent</span></div>
      <h2 className="mh-title" id="mh-quiz-title">Not Sure Which One?</h2>
      <div className="mh-quiz-card" aria-live="polite">
        {step < 3 && (
          <div className="mh-quiz-steps" aria-hidden>
            <span className={step >= 1 ? "on" : ""} /><span className={step >= 2 ? "on" : ""} />
          </div>
        )}
        {step === 1 && (
          <div className="mh-quiz-q" key="q1">
            <p className="mh-quiz-ask">Who is it for?</p>
            <div className="mh-quiz-opts">
              <button type="button" onClick={() => setWho("him")}><b>For Him</b><span>A signature for him</span></button>
              <button type="button" onClick={() => setWho("her")}><b>For Her</b><span>A signature for her</span></button>
              <button type="button" onClick={() => setWho("both")}><b>A Gift for Two</b><span>One for him, one for her</span></button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="mh-quiz-q" key="q2">
            <p className="mh-quiz-ask">Which feels more like {who === "him" ? "him" : "her"}?</p>
            <div className="mh-quiz-opts">
              <button type="button" onClick={() => setMood("bold")}><b>Warm &amp; Bold</b><span>Coffee, leather, dark amber</span></button>
              <button type="button" onClick={() => setMood("soft")}><b>Soft &amp; Sweet</b><span>Vanilla, praline, pear</span></button>
            </div>
            <button type="button" className="mh-quiz-back" onClick={() => setWho(null)}>← Back</button>
          </div>
        )}
        {result && (
          <div className="mh-quiz-result" key={result.id}>
            <span className="mh-quiz-match">Your match</span>
            <Link href={`/product/${result.slug}`} className="mh-quiz-img">
              <Image src={result.image} alt={`MIJAB ${result.name}`} fill sizes="140px" />
            </Link>
            <b className="mh-quiz-name">{result.name}</b>
            <span className="mh-quiz-blurb">{result.blurb}</span>
            <span className="mh-quiz-price">{formatPrice(result.price)}</span>
            <AddToBag id={result.id} go={null} className="mh-pill dark" label={result.id === "duo" ? "Add the pair" : "Add to bag"} />
            <div className="mh-quiz-links">
              <Link href={`/product/${result.slug}`}>View details</Link>
              <button type="button" onClick={reset}>Start again</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** Fades sections up as they scroll into view. Content stays visible without JS
 * and for anyone who prefers reduced motion. */
export function RevealOnScroll() {
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".mh-reveal"));
    const vh = window.innerHeight;
    els.forEach((el) => { if (el.getBoundingClientRect().top > vh * 0.92) el.classList.add("mh-hidden"); });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.remove("mh-hidden"); io.unobserve(e.target); }
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((el) => el.classList.contains("mh-hidden") && io.observe(el));
    return () => { io.disconnect(); els.forEach((el) => el.classList.remove("mh-hidden")); };
  }, []);
  return null;
}

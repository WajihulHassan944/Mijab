"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Arrow, Mail } from "./Icons";

/** tone: what sits behind the header icons, so they can switch colour to stay visible */
type Slide = { img: string; alt: string; tone: "light" | "dark"; full?: boolean; bags?: boolean; title: ReactNode; sub: string; cta: string; href: string };

/** Mobile home hero: a three-slide banner under the transparent header.
 * Swipe, tap a dot, or let it advance on its own (paused while touched). */
export function MobileHero({ duoImage }: { duoImage: string }) {
  const slides: Slide[] = [
    {
      img: "/images/m-home/hero-bg.jpg",
      alt: "",
      tone: "light",
      full: true,
      bags: true,
      title: <>More Than<br />Just a <em>Scent</em></>,
      sub: "A lasting impression\nin every spray.",
      cta: "Shop Best Sellers",
      href: "/shop",
    },
    {
      img: duoImage,
      alt: "MIJAB Café Noir and Vanilla Gourmand",
      tone: "dark",
      title: <>Two Fragrances.<br /><em>One Story.</em></>,
      sub: "Gift him, gift her, or keep both.",
      cta: "Shop the Duo",
      href: "/product/duo",
    },
    {
      img: "/images/about-boxes.jpg",
      alt: "MIJAB boxes for her and for him",
      tone: "light",
      title: <>Luxury in<br />Every <em>Detail</em></>,
      sub: "Every MIJAB arrives in its own signature bag.",
      cta: "Explore Collection",
      href: "/shop",
    },
  ];
  const n = slides.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const go = useCallback((d: number) => setI((cur) => (cur + d + n) % n), [n]);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [paused, go]);

  return (
    <section
      className="mh-hero only-mobile"
      data-tone={slides[i].tone}
      aria-roledescription="carousel"
      aria-label="Featured"
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={(e) => {
        if (touchX.current !== null) {
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }
        touchX.current = null;
        setPaused(false);
      }}
    >
      <div className="mh-hero-track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((s, k) => (
          <div className={`mh-slide${s.full ? " full" : ""}`} key={s.cta} aria-roledescription="slide" aria-label={`${k + 1} of ${n}`} inert={k !== i}>
            <div className="mh-slide-img">
              <Image src={s.img} alt={s.alt} fill sizes="100vw" priority={k === 0} />
            </div>
            {s.bags && (
              <div className="mh-slide-bags">
                <Image src="/images/bag-pink.png" alt="MIJAB bag with pink bow" width={270} height={425} sizes="30vw" priority />
                <Image src="/images/bag-black.png" alt="MIJAB bag with black bow" width={280} height={430} sizes="30vw" priority />
              </div>
            )}
            <div className="mh-slide-copy">
              {k === 0 ? <h1>{s.title}</h1> : <h2>{s.title}</h2>}
              <p>{s.sub}</p>
              <Link href={s.href} className="mh-pill blush">{s.cta} <Arrow stroke="#2A1D18" w={13} /></Link>
            </div>
          </div>
        ))}
      </div>
      <div className="mh-dots" role="tablist" aria-label="Choose slide">
        {slides.map((s, k) => (
          <button key={s.cta} type="button" role="tab" aria-selected={k === i} aria-label={`Show slide ${k + 1}`} className={k === i ? "on" : ""} onClick={() => setI(k)} />
        ))}
      </div>
    </section>
  );
}

/** Newsletter sign-up. Goes to the admin Messages inbox through the contact endpoint. */
export function Newsletter() {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!email) return;
    setError("");
    setState("busy");
    try {
      await api.contact.submit({
        name: "Newsletter subscriber",
        email,
        subject: "Newsletter sign-up",
        body: `Please add ${email} to the MIJAB mailing list for offers and new scents.`,
      });
      setState("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign you up. Please try again.");
      setState("idle");
    }
  }

  return (
    <section className="mh-news only-mobile" aria-labelledby="mh-news-title">
      <Image className="mh-news-bg" src="/images/m-home/newsletter.jpg" alt="" fill sizes="100vw" />
      <div className="mh-eyebrow"><span>Stay Updated</span></div>
      <h2 id="mh-news-title">Join Our Fragrance Family</h2>
      <p>Get exclusive offers and early access to new scents.</p>
      {state === "done" ? (
        <p className="mh-news-done" role="status">Thank you! You&apos;re on the list.</p>
      ) : (
        <form className="mh-news-form" onSubmit={submit}>
          <Mail size={18} stroke="#2a1d18" width={1.5} />
          <label className="sr-only" htmlFor="mh-news-email">Email address</label>
          <input id="mh-news-email" name="email" type="email" placeholder="Enter your email address" autoComplete="email" required />
          <button type="submit" disabled={state === "busy"}>{state === "busy" ? "…" : "Subscribe"}</button>
        </form>
      )}
      {error && <p className="mh-news-err" role="alert">{error}</p>}
    </section>
  );
}

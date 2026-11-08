"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiReview } from "@/lib/api";

/** "Sara Khan" → "SK", "Mr. Waqar" → "MW"; a single-word name borrows the city's initial. */
function initials(name: string, city: string) {
  const words = name.split(/\s+/).filter(Boolean);
  return ((words[0] ?? "").charAt(0) + (words[1] ?? city ?? "").charAt(0)).toUpperCase() || "M";
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

function Star({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={on ? "on" : ""}>
      <path d="M12 2.6l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
    </svg>
  );
}

export function Testimonials({ reviews }: { reviews: ApiReview[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = reviews.length;

  const go = useCallback((d: number) => setI((cur) => (cur + d + n) % n), [n]);

  // gentle auto-advance; pauses while hovered/focused
  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setInterval(() => go(1), 7000);
    return () => clearInterval(t);
  }, [n, paused, go]);

  if (!n) return null;

  return (
    <section className="testi" id="reviews" aria-roledescription="carousel" aria-label="Customer reviews">
      <img className="silk tl" src="/images/reviews/silk-tl.webp" alt="" aria-hidden />
      <img className="silk tr" src="/images/reviews/silk-tr.webp" alt="" aria-hidden />
      <img className="silk bl" src="/images/reviews/silk-bl.webp" alt="" aria-hidden />
      <img className="silk br" src="/images/reviews/silk-br.webp" alt="" aria-hidden />

      <div className="testi-inner">
        <div className="testi-eyebrow"><span>Loved by our customers</span></div>
        <h2>In their words.</h2>
        <div className="testi-rule" />

        <div
          className="testi-stage"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          {n > 1 && (
            <button type="button" className="testi-arrow prev" onClick={() => go(-1)} aria-label="Previous review">
              <Chevron dir="left" />
            </button>
          )}

          <div className="testi-viewport">
            <div className="testi-track" style={{ transform: `translateX(-${i * 100}%)` }}>
              {reviews.map((r, k) => (
                <div className="testi-slide" key={r.id} aria-roledescription="slide" aria-label={`${k + 1} of ${n}`} aria-hidden={k !== i}>
                <figure className="testi-card">
                  <div className="testi-card-top">
                    <span className="testi-quote" aria-hidden>&ldquo;</span>
                    <div className="testi-stars" role="img" aria-label={`${r.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((s) => <Star key={s} on={s <= r.rating} />)}
                    </div>
                  </div>
                  <blockquote>&ldquo;{r.body}&rdquo;</blockquote>
                  <figcaption>
                    <span className="testi-avatar" aria-hidden>{initials(r.name, r.city)}</span>
                    <span className="testi-who">
                      <b>{r.name}{r.city && ` · ${r.city}`}</b>
                      {r.products.length > 0 && <small>{r.products.join(" · ")}</small>}
                    </span>
                  </figcaption>
                </figure>
                </div>
              ))}
            </div>
          </div>

          {n > 1 && (
            <button type="button" className="testi-arrow next" onClick={() => go(1)} aria-label="Next review">
              <Chevron dir="right" />
            </button>
          )}
        </div>

        {n > 1 && (
          <div className="testi-dots" role="tablist" aria-label="Choose review">
            {reviews.map((r, k) => (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={k === i}
                aria-label={`Show review ${k + 1}`}
                className={k === i ? "on" : ""}
                onClick={() => setI(k)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

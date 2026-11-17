"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BagIcon } from "@/components/Icons";
import type { ProductId } from "@/lib/products";
import { useStore } from "@/lib/store";

/** One gallery picture. `contain` is for cut-outs (the gift bags); `pos` is an object-position for wide scenes. */
export type Shot = { id: string; src: string; alt: string; contain?: boolean; whole?: boolean; pos?: string };

function Chevron({ dir }: { dir: "l" | "r" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d={dir === "l" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

/** Thumbnails + main image on desktop; a swipeable strip with arrows on phones. */
export function LxGallery({ shots, ratio = "1 / 1" }: { shots: Shot[]; ratio?: string }) {
  const [i, setI] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  const n = shots.length;

  // keep the swipe strip and the selected thumbnail in step
  const goTo = (k: number) => {
    const next = (k + n) % n;
    setI(next);
    const el = strip.current;
    if (el) el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };
  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const onScroll = () => setI(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="lp-gallery" style={{ ["--lp-ratio" as string]: ratio }}>
      <div className="lp-thumbs" role="tablist" aria-label="Product photos">
        {shots.map((s, k) => (
          <button key={s.id} type="button" role="tab" aria-selected={i === k} aria-label={`Show ${s.alt}`} className={`lp-thumb${i === k ? " on" : ""}${s.contain ? " contain" : ""}`} onClick={() => goTo(k)}>
            <Image src={s.src} alt="" fill sizes="80px" style={s.pos ? { objectPosition: s.pos } : undefined} />
          </button>
        ))}
      </div>
      <div className="lp-main">
        <div className="lp-strip" ref={strip}>
          {shots.map((s, k) => (
            <div className={`lp-slide${s.contain ? " contain" : ""}${s.whole ? " whole" : ""}`} key={s.id} aria-hidden={i !== k}>
              <Image src={s.src} alt={s.alt} fill priority={k === 0} sizes="(max-width: 820px) 100vw, 480px" style={s.pos ? { objectPosition: s.pos } : undefined} />
            </div>
          ))}
        </div>
        {n > 1 && (
          <>
            <button type="button" className="lp-arrow l" aria-label="Previous photo" onClick={() => goTo(i - 1)}><Chevron dir="l" /></button>
            <button type="button" className="lp-arrow r" aria-label="Next photo" onClick={() => goTo(i + 1)}><Chevron dir="r" /></button>
          </>
        )}
      </div>
    </div>
  );
}

function Qty({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="lp-qty">
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(Math.max(1, value - 1))}>−</button>
      <span aria-live="polite">{value}</span>
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(Math.min(10, value + 1))}>+</button>
    </div>
  );
}

/** Quantity, Add to Bag and Buy Now, plus a sticky bar on phones once the main buttons scroll away. */
export function LxBuy({ id, name }: { id: ProductId; name: string }) {
  const { add } = useStore();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [stuck, setStuck] = useState(false);
  const row = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = row.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const addToBag = () => {
    add(id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <>
      <div className="lp-buy" ref={row}>
        <Qty value={qty} onChange={setQty} />
        <button type="button" className="lx-btn dark lp-add" onClick={addToBag}>
          <BagIcon size={18} stroke="currentColor" width={1.4} />{added ? "Added to bag" : "Add to Bag"}
        </button>
        <button type="button" className="lx-btn lp-now" onClick={() => { add(id, qty); router.push("/checkout"); }}>Buy Now</button>
      </div>
      <div className={`lp-sticky${stuck ? " on" : ""}`} aria-hidden={!stuck} inert={!stuck}>
        <Qty value={qty} onChange={setQty} />
        <button type="button" className="lx-btn dark" onClick={addToBag} aria-label={`Add ${name} to bag`}>
          <BagIcon size={18} stroke="currentColor" width={1.4} />{added ? "Added" : "Add to Bag"}
        </button>
      </div>
    </>
  );
}

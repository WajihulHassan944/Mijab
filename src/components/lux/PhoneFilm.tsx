"use client";

import { useEffect, useRef, useState } from "react";

/** Phone hero: the portrait campaign photo, which becomes a looping film on phones
 * (skipped on larger screens and for people who prefer reduced motion). */
export function PhoneFilm({ alt }: { alt: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 820px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPlay(mobile && !reduce);
  }, []);
  useEffect(() => {
    ref.current?.play().catch(() => {});
  }, [play]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/home/hero-m.jpg" alt={alt} fetchPriority="high" />
      {play && (
        <video ref={ref} className="lx-mhero-film" src="/images/home/hero-film-m.mp4" poster="/images/home/hero-m.jpg" autoPlay muted loop playsInline preload="auto" aria-hidden />
      )}
    </>
  );
}

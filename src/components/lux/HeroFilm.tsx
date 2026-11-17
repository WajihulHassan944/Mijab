"use client";

import { useEffect, useRef, useState } from "react";

/** Full-bleed looping hero film. Phones get a portrait cut, larger screens the
 * widescreen one; people who prefer reduced motion just see the poster. */
export function HeroFilm() {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<{ video: string; poster: string } | null>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 820px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setStill(reduce);
    setSrc(
      mobile
        ? { video: "/images/home/hero-film-m.mp4", poster: "/images/home/hero-film-m-poster.jpg" }
        : { video: "/images/home/hero-film.mp4", poster: "/images/home/hero-film-poster.jpg" },
    );
  }, []);

  useEffect(() => {
    // some browsers ignore the autoplay attribute after a client-side render
    ref.current?.play().catch(() => {});
  }, [src]);

  return (
    <div className="lx-film" aria-hidden>
      {/* first paint: the poster, chosen per breakpoint in CSS */}
      <picture>
        <source media="(max-width: 820px)" srcSet="/images/home/hero-film-m-poster.jpg" />
        <img src="/images/home/hero-film-poster.jpg" alt="" fetchPriority="high" />
      </picture>
      {src && !still && (
        <video ref={ref} key={src.video} src={src.video} poster={src.poster} autoPlay muted loop playsInline preload="auto" />
      )}
    </div>
  );
}

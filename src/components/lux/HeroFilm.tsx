"use client";

import { useEffect, useRef, useState } from "react";

/** Full-bleed looping hero film for tablets and desktops; people who prefer
 * reduced motion just see the poster. */
export function HeroFilm() {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<{ video: string; poster: string } | null>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    // phones show their own portrait hero instead, so they skip the film entirely
    if (window.matchMedia("(max-width: 820px)").matches) return;
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setSrc({ video: "/images/home/hero-film.mp4", poster: "/images/home/hero-film-poster.jpg" });
  }, []);

  useEffect(() => {
    // some browsers ignore the autoplay attribute after a client-side render
    ref.current?.play().catch(() => {});
  }, [src]);

  return (
    <div className="lx-film" aria-hidden>
      {/* lazy, so phones (where this section is hidden) never download it */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/home/hero-film-poster.jpg" alt="" loading="lazy" />
      {src && !still && (
        <video ref={ref} key={src.video} src={src.video} poster={src.poster} autoPlay muted loop playsInline preload="auto" />
      )}
    </div>
  );
}

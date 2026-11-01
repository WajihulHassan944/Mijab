import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arrow, Diamond, Gift, Heart, Lotus } from "@/components/Icons";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <section className="about-hero">
        <div className="wrap in">
          <div className="l">
            <div className="eyebrow-line">About Mijab</div>
            <h1 className="h1">The Wait Is Over.<br />MIJAB Is Here.</h1>
            <p className="lead">
              Some things are more than a fragrance.
              <br />They are a feeling, a memory, a little touch of confidence, and a part of who we are.
            </p>
            <p>Today, we begin our journey — with two fragrances and a dream to make every moment feel special.</p>
            <div className="for-row">
              <span>🖤 For him.</span>
              <span className="div" />
              <span>❤️ For her.</span>
            </div>
            <div className="avail">MIJAB IS NOW AVAILABLE.</div>
            <div className="avail-sub">A new beginning. A fragrance that feels like you.</div>
            <div className="rule" />
            <div className="welcome">Welcome to the MIJAB family. 🤍</div>
          </div>
        </div>
        <div className="r only-mobile">
          <Image src="/images/duo.jpg" alt="MIJAB Café Noir and Vanilla Gourmand" fill sizes="100vw" priority />
        </div>
      </section>

      <section className="about-story">
        <div className="wrap in">
          <div className="img"><Image src="/images/about-boxes.jpg" alt="MIJAB Eau de Parfum gift boxes, for her and for him" fill sizes="(max-width: 820px) 100vw, 460px" /></div>
          <div className="copy">
            <div className="eyebrow-line">Our Story</div>
            <h2>MIJAB — a little touch of elegance in everyday moments.</h2>
            <p>
              Thoughtfully created for those who appreciate beauty, comfort, and refined simplicity. MIJAB brings
              together delightful essences designed to make every journey and every day feel a little more special.
            </p>
            <p className="it">MIJAB — made for beautiful beginnings.</p>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="wrap">
          <div className="eyebrow-center">More Than a Fragrance</div>
          <h2>A Feeling. A Memory. You.</h2>
          <div className="row">
            <div className="item"><Diamond size={30} /><b>Premium<br />Quality</b></div>
            <span className="div" />
            <div className="item"><Lotus size={30} /><b>Elegant<br />Essence</b></div>
            <span className="div" />
            <div className="item"><Gift size={30} /><b>Perfect<br />for Gifting</b></div>
            <span className="div" />
            <div className="item"><Heart size={30} /><b>Made<br />With Love</b></div>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <Image src="/images/couple.jpg" alt="A couple sharing a close, quiet moment" fill sizes="100vw" />
        <div className="in">
          <Logo width={150} title="MIJAB" />
          <div className="sub">A Little Touch of Elegance</div>
          <Link href="/shop" className="btn-blush">Shop MIJAB <Arrow stroke="#2A1D18" /></Link>
        </div>
      </section>
    </>
  );
}

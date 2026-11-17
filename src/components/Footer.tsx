import { Logo } from "./Logo";
import Link from "next/link";
import { Instagram, Mail } from "./Icons";
import { NewsletterForm } from "./lux/NewsletterForm";
import { CONTACT_EMAIL, CONTACT_PHONE, INSTAGRAM_URL } from "@/lib/site";

const WHATSAPP = `https://wa.me/${CONTACT_PHONE.replace(/\D/g, "")}`;

export function Footer() {
  return (
    <footer className="lx-footer">
      <div className="lx-footer-inner">
        <div className="lx-footer-brand">
          <Link href="/" aria-label="MIJAB home"><Logo width={124} title="MIJAB" /></Link>
          <span className="lx-footer-tag">Eau de Parfum</span>
          <div className="lx-footer-social lx-only-m">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="MIJAB on Instagram"><Instagram size={22} stroke="#f0e4dc" /></a>
            <a href={`mailto:${CONTACT_EMAIL}`} aria-label="Email MIJAB"><Mail size={22} stroke="#f0e4dc" /></a>
          </div>
        </div>

        <nav className="lx-footer-col" aria-label="Shop">
          <b>Shop</b>
          <Link href="/shop">All Fragrances</Link>
          <Link href="/product/duo">The Duo</Link>
          <Link href="/product/perfume-wax">Perfume Wax</Link>
        </nav>
        <nav className="lx-footer-col" aria-label="Help">
          <b>Help</b>
          <Link href="/contact#faq">FAQs</Link>
          <Link href="/track">Track Your Order</Link>
          <Link href="/contact#faq">Shipping &amp; Returns</Link>
        </nav>
        <div className="lx-footer-col">
          <b>Contact</b>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">WhatsApp {CONTACT_PHONE}</a>
          <Link href="/about">Our Story</Link>
        </div>

        <div className="lx-footer-news">
          <b>Stay in the Loop</b>
          <p>Be the first to know about new launches and exclusive offers.</p>
          <div className="lx-footer-news-row">
            <NewsletterForm id="footer-news" />
            <a className="lx-hide-m lx-footer-ig" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="MIJAB on Instagram"><Instagram size={24} stroke="#f0e4dc" /></a>
          </div>
        </div>
      </div>
      <div className="lx-footer-bottom">
        <span>© {new Date().getFullYear()} MIJAB. All rights reserved.</span>
        <span>Scent / Elegance / You</span>
      </div>
    </footer>
  );
}

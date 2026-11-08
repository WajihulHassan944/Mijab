import { Logo } from "./Logo";
import Link from "next/link";
import { Facebook, Instagram, TikTok } from "./Icons";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top only-desktop">
        <Link href="/" aria-label="MIJAB">
          <Logo width={88} title="MIJAB" />
        </Link>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/shop">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/track">Track order</Link>
          <Link href="/account">My account</Link>
        </nav>
        <div className="socials">
          <a href="#" aria-label="Instagram"><Instagram /></a>
          <a href="#" aria-label="TikTok"><TikTok /></a>
          <a href="#" aria-label="Facebook"><Facebook /></a>
        </div>
      </div>
      <div className="footer-bottom only-desktop">
        <span>© MIJAB · Scent / Elegance / You</span>
        <span>Shipping &amp; Returns · Privacy · Terms</span>
      </div>

      {/* phone layout */}
      <div className="m-footer only-mobile">
        <div className="m-footer-grid">
          <div className="m-footer-brand">
            <Link href="/" aria-label="MIJAB home"><Logo width={96} title="MIJAB" /></Link>
            <p>Scent / Elegance / You</p>
            <div className="m-footer-socials">
              <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
              <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
              <a href="#" aria-label="TikTok"><TikTok size={20} /></a>
            </div>
          </div>
          <nav className="m-footer-col" aria-label="Shop">
            <b>Shop</b>
            <Link href="/shop">All Products</Link>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <nav className="m-footer-col" aria-label="Support">
            <b>Support</b>
            <Link href="/contact#faq">FAQs</Link>
            <Link href="/track">Track Order</Link>
            <Link href="/contact#faq">Returns</Link>
          </nav>
        </div>
        <div className="m-footer-copy"><span>© {new Date().getFullYear()} MIJAB. All rights reserved.</span></div>
      </div>
    </footer>
  );
}

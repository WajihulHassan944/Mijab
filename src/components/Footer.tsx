import { Logo } from "./Logo";
import Link from "next/link";
import { Facebook, Instagram, TikTok } from "./Icons";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
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
      <div className="footer-bottom">
        <span>© MIJAB · Scent / Elegance / You</span>
        <span>Shipping &amp; Returns · Privacy · Terms</span>
      </div>
    </footer>
  );
}

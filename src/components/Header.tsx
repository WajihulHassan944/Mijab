"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountIcon, BagIcon, SearchIcon } from "./Icons";
import { useStore } from "@/lib/store";

const nav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const { count, user } = useStore();
  const overlay = pathname === "/";
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href) || (href === "/shop" && pathname.startsWith("/product")));

  return (
    <header className={`header${overlay ? " overlay" : ""}`}>
      <Link href="/" className="logo" aria-label="MIJAB home">
        {overlay && <Image className="logo-hero" src="/images/logo-hero@4x.png" alt="MIJAB" width={212} height={95} priority unoptimized style={{ width: 70, height: "auto" }} />}
        <Image className={overlay ? "logo-mobile" : undefined} src="/images/logo-dark@4x.png" alt={overlay ? "" : "MIJAB"} width={212} height={95} priority unoptimized style={{ width: 70, height: "auto" }} />
      </Link>
      <nav className="nav" aria-label="Primary">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className={active(n.href) ? "active" : ""} aria-current={active(n.href) ? "page" : undefined}>
            {n.href === "/shop" && overlay ? "Our Collection" : n.label}
          </Link>
        ))}
      </nav>
      <div className="icons">
        <Link href="/shop" className="icon-btn" aria-label="Search">
          <SearchIcon />
        </Link>
        <Link href={user ? "/account" : "/sign-in"} className="icon-btn acct-ico" aria-label="Account">
          <AccountIcon />
        </Link>
        <Link href="/bag" className="icon-btn" aria-label={`Bag, ${count} item${count === 1 ? "" : "s"}`}>
          <BagIcon />
          {count > 0 && <span className="badge">{count}</span>}
        </Link>
      </div>
    </header>
  );
}

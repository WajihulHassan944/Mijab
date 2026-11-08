"use client";

import { Logo } from "./Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AccountIcon, BagIcon, CloseIcon, MenuIcon, SearchIcon } from "./Icons";
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  // lock scrolling behind the open menu; Escape closes it
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className={`header${overlay ? " overlay" : ""}${menuOpen ? " menu-open" : ""}`}>
      {overlay && (
        <button type="button" className="menu-btn icon-btn" aria-label="Open menu" aria-expanded={menuOpen} aria-controls="m-menu" onClick={() => setMenuOpen(true)}>
          <MenuIcon size={26} width={1.6} />
        </button>
      )}
      <Link href="/" className="logo" aria-label="MIJAB home">
        {overlay && <Logo className="logo-hero" width={84} title="MIJAB" />}
        <Logo className={overlay ? "logo-mobile" : "logo-solid"} width={84} title={overlay ? undefined : "MIJAB"} />
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

      {overlay && (
        <div className={`m-menu${menuOpen ? " open" : ""}`} id="m-menu" inert={!menuOpen}>
          <button type="button" className="m-menu-scrim" aria-label="Close menu" tabIndex={-1} onClick={() => setMenuOpen(false)} />
          <div className="m-menu-panel" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="m-menu-top">
              <Logo width={78} title="MIJAB" />
              <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                <CloseIcon size={24} stroke="#f6eae2" width={1.5} />
              </button>
            </div>
            <nav aria-label="Menu">
              {[...nav, { href: "/track", label: "Track Order" }, { href: user ? "/account" : "/sign-in", label: user ? "My Account" : "Sign In" }].map((n) => (
                <Link key={n.label} href={n.href} onClick={() => setMenuOpen(false)} aria-current={pathname === n.href ? "page" : undefined}>
                  {n.label}
                </Link>
              ))}
            </nav>
            <p className="m-menu-note">Free delivery across Pakistan · Cash on delivery</p>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountIcon, BagIcon, HomeIcon, ShopIcon } from "./Icons";
import { useStore } from "@/lib/store";

export function TabBar() {
  const pathname = usePathname();
  const { count, user } = useStore();
  const tabs = [
    { href: "/", label: "Home", icon: HomeIcon, on: pathname === "/" },
    { href: "/shop", label: "Shop", icon: ShopIcon, on: pathname.startsWith("/shop") || pathname.startsWith("/product") },
    { href: "/bag", label: "Bag", icon: BagIcon, on: pathname === "/bag" || pathname === "/checkout" },
    { href: user ? "/account" : "/sign-in", label: "Account", icon: AccountIcon, on: ["/account", "/sign-in", "/track"].includes(pathname) },
  ];
  return (
    <div className="tabbar-wrap">
      {pathname === "/" && count > 0 && (
        <Link href="/bag" className="view-bag">
          <span>View bag · {count}</span>
          <span aria-hidden>→</span>
        </Link>
      )}
      <nav className="tabbar" aria-label="Tabs">
        {tabs.map((t) => (
          <Link key={t.label} href={t.href} className={t.on ? "on" : ""} aria-current={t.on ? "page" : undefined}>
            <t.icon size={22} stroke={t.on ? "#17110F" : "#6b5a52"} />
            <span>{t.label}</span>
            {t.label === "Bag" && count > 0 && <span className="badge">{count}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}

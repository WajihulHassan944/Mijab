import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/Icons";
import { fetchCatalog } from "@/lib/catalog";
import { ShopGrid } from "./ShopGrid";
import "./shop.css";

export const metadata: Metadata = {
  title: "Shop Perfumes",
  description:
    "Shop MIJAB: Café Noir eau de parfum for him, Vanilla Gourmand for her, The Duo gift set and the new alcohol-free Perfume Wax. Delivery across Pakistan, cash on delivery available.",
  alternates: { canonical: "/shop" },
};
export const revalidate = 0;

export default async function ShopPage() {
  const catalog = await fetchCatalog();
  return (
    <div className="lx ls">
      <section className="ls-hero">
        <Image src="/images/shop/banner.jpg" alt="" fill priority sizes="100vw" className="ls-hero-img" />
        <div className="ls-hero-shade" />
        <div className="lx-wrap ls-hero-copy">
          <div className="lx-eyebrow gold lined">The Collection</div>
          <h1>Shop All Fragrances</h1>
          <p>Explore MIJAB&apos;s refined fragrances for him, for her, and for gifting.</p>
        </div>
      </section>

      <div className="lx-wrap ls-body">
        <ShopGrid initialProducts={Object.values(catalog)} />

        <section className="ls-gift">
          <Image src="/images/shop/banner.jpg" alt="MIJAB gift bags with pink and black bows" fill sizes="(max-width: 820px) 100vw, 1180px" className="ls-gift-img" />
          <div className="ls-gift-copy">
            <h2><em>Every order arrives gift-ready</em></h2>
            <p>Thoughtfully wrapped for him, for her, or for sharing.</p>
            <Link href="/product/duo" className="lx-btn dark sm">Shop the Duo <Arrow /></Link>
          </div>
        </section>
      </div>
    </div>
  );
}

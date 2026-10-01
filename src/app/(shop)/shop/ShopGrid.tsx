"use client";

import Link from "next/link";
import { useState } from "react";
import { AddToBag } from "@/components/Buttons";
import { Arrow, ChevronDown } from "@/components/Icons";
import { ProductMedia } from "@/components/Media";
import { formatPrice, Product } from "@/lib/products";

const filters = ["All", "For Him", "For Her", "The Duo"] as const;
type Filter = (typeof filters)[number];
const sorts = ["Featured", "Price: low to high", "Price: high to low", "Name"] as const;

export function ShopGrid({ initialProducts }: { initialProducts: Product[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<(typeof sorts)[number]>("Featured");

  let items = initialProducts.filter((p) => filter === "All" || (filter === "For Him" && p.id === "cafe-noir") || (filter === "For Her" && p.id === "vanilla-gourmand") || (filter === "The Duo" && p.id === "duo"));
  if (sort === "Price: low to high") items = [...items].sort((a, b) => a.price - b.price);
  if (sort === "Price: high to low") items = [...items].sort((a, b) => b.price - a.price);
  if (sort === "Name") items = [...items].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <div className="filterbar">
        <div className="chips" role="tablist" aria-label="Filter products">
          {filters.map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} className={`chip${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <label className="sort">
          Sort:
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort products">
            {sorts.map((s) => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown size={16} stroke="#4a3a30" />
        </label>
      </div>

      <section className="grid-3" aria-live="polite">
        {items.map((p) => {
          const href = p.id === "duo" ? null : `/product/${p.slug}`;
          const media = (
            <ProductMedia product={p} sizes="(max-width: 820px) 50vw, 300px">
              {p.id === "duo" && p.compareAt && p.compareAt > p.price && <span className="badge-save">Save {formatPrice(p.compareAt - p.price)}</span>}
            </ProductMedia>
          );
          return (
            <div className="shop-card" key={p.id}>
              {href ? <Link href={href} style={{ display: "block" }}>{media}</Link> : media}
              <div className="eyebrow lbl">{p.audience}</div>
              {href ? <Link href={href} className="nm">{p.name}</Link> : <span className="nm">{p.name}</span>}
              <div className="bl">{p.blurb}</div>
              <div className="pr">
                <span>{formatPrice(p.price)}</span>
                {p.compareAt && <span className="strike">{formatPrice(p.compareAt)}</span>}
              </div>
              <AddToBag id={p.id} />
            </div>
          );
        })}
      </section>

      <section className="bag-banner">
        <div className="imgs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/bag-pink.png" alt="Pink MIJAB bag" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/bag-black.png" alt="Black MIJAB bag" />
        </div>
        <div className="t">
          Every order arrives in a signature MIJAB bag
          <small>Pink for her. Black for him.</small>
        </div>
        <AddToBag id="duo" className="btn-outline" label="Shop the Duo" arrow />
      </section>
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AddToBag } from "@/components/Buttons";
import { ChevronDown } from "@/components/Icons";
import { formatPrice, lookImage, Product } from "@/lib/products";

const filters = ["All", "For Him", "For Her", "The Duo", "Perfume Wax"] as const;
type Filter = (typeof filters)[number];
const sorts = ["Featured", "Price: low to high", "Price: high to low", "Name"] as const;
const ORDER = ["cafe-noir", "vanilla-gourmand", "duo", "perfume-wax"];

const matches = (p: Product, f: Filter) =>
  f === "All" ||
  (f === "For Him" && p.id === "cafe-noir") ||
  (f === "For Her" && p.id === "vanilla-gourmand") ||
  (f === "The Duo" && p.id === "duo") ||
  (f === "Perfume Wax" && p.id === "perfume-wax");

export function ShopGrid({ initialProducts }: { initialProducts: Product[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<(typeof sorts)[number]>("Featured");

  let items = initialProducts.filter((p) => matches(p, filter));
  const rank = (p: Product) => (ORDER.indexOf(p.id) + 1 || 99);
  items = [...items].sort((a, b) => rank(a) - rank(b));
  if (sort === "Price: low to high") items.sort((a, b) => a.price - b.price);
  if (sort === "Price: high to low") items.sort((a, b) => b.price - a.price);
  if (sort === "Name") items.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <div className="ls-bar">
        <div className="ls-chips" role="tablist" aria-label="Filter products">
          {filters.map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} className={`ls-chip${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <label className="ls-sort">
          <span>Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort products">
            {sorts.map((s) => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown size={15} stroke="#2a1d18" />
        </label>
      </div>

      <div className="lx-cards ls-cards" aria-live="polite">
        {items.map((p) => {
          const save = p.compareAt && p.compareAt > p.price ? p.compareAt - p.price : 0;
          return (
            <article className="lx-card" key={p.id}>
              <Link href={`/product/${p.slug}`} className="lx-card-img">
                <Image src={lookImage(p)} alt={`MIJAB ${p.name}`} fill sizes="(max-width: 820px) 46vw, 270px" />
              </Link>
              <div className="lx-card-body">
                <div className="lx-card-name">
                  <Link href={`/product/${p.slug}`}>{p.name}</Link>
                  {p.id === "perfume-wax" && <span className="lx-new">New</span>}
                </div>
                <div className="lx-card-meta">
                  {p.id === "duo" ? (
                    <span className="lx-card-sub">Café Noir + Vanilla Gourmand</span>
                  ) : p.id === "perfume-wax" ? (
                    <span className="lx-card-sub">Alcohol-free solid perfume</span>
                  ) : (
                    <>
                      <span className="lx-tag">{p.audience}</span>
                      <span className="lx-card-sub">Eau de Parfum · 50 ml</span>
                    </>
                  )}
                </div>
                <div className="lx-card-price">
                  <span>{formatPrice(p.price)}</span>
                  {save > 0 && <s>{formatPrice(p.compareAt!)}</s>}
                  {save > 0 && <span className="lx-save">Save {formatPrice(save)}</span>}
                </div>
                <AddToBag id={p.id} className="lx-btn dark sm" label="Add to Bag" icon go={null} />
              </div>
            </article>
          );
        })}
        {items.length === 0 && <p className="ls-empty">Nothing here just yet. Try another filter.</p>}
      </div>
    </>
  );
}

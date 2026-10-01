import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductMedia } from "@/components/Media";
import { Arrow } from "@/components/Icons";
import { formatPrice, ProductId } from "@/lib/products";
import { fetchCatalog } from "@/lib/catalog";
import { PurchasePanel } from "./PurchasePanel";

export const revalidate = 0; // always the live catalog, never a stale build-time snapshot

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await fetchCatalog();
  const p = catalog[slug];
  return { title: p ? p.name : "Product" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await fetchCatalog();
  const product = slug !== "duo" ? catalog[slug] : undefined;
  if (!product) notFound();
  const other = catalog[(product.id === "cafe-noir" ? "vanilla-gourmand" : "cafe-noir") as ProductId];
  const duo = catalog.duo;
  const n = product.notes!;

  return (
    <>
      <div className="wrap">
        <div className="pcrumbs"><Link href="/">Home</Link> &nbsp;/&nbsp; <Link href="/shop">Shop</Link> &nbsp;/&nbsp; <span>{product.name}</span></div>
        <PurchasePanel product={product} />

        <section className="pdp-details">
          <div>
            <div className="eyebrow hd">Scent notes</div>
            <div className="note"><span className="k">Top</span><span className="v">{n.top}</span></div>
            <div className="note"><span className="k">Heart</span><span className="v">{n.heart}</span></div>
            <div className="note"><span className="k">Base</span><span className="v">{n.base}</span></div>
          </div>
          <div>
            <div className="eyebrow hd">Details</div>
            <div className="li">Eau de Parfum · 50 ml</div>
            <div className="li">{product.audience}</div>
            <div className="li">Bottle: {product.bottle}</div>
            <div className="li">Comes in: {product.bagLabel}</div>
          </div>
          <div>
            <div className="eyebrow hd">Delivery</div>
            <div className="li">Delivery cost and options are shown at checkout.</div>
            <div className="li">Signature gift bag included.</div>
            <div className="li">Questions? Visit the <Link href="/contact" style={{ textDecoration: "underline" }}>contact page</Link>.</div>
          </div>
        </section>
      </div>

      <section className="more">
        <div className="wrap">
          <div className="eyebrow">Complete the pair</div>
          <h2>You may also like</h2>
          <div className="more-grid">
            <Link href={`/product/${other.slug}`} className="more-card">
              <ProductMedia product={other} sizes="140px" />
              <div className="c">
                <div className="eyebrow">{other.audience}</div>
                <div className="n">{other.name}</div>
                <div className="p">{formatPrice(other.price)}</div>
                <div className="link-arrow">View <Arrow stroke="#9B6B66" w={12} /></div>
              </div>
            </Link>
            <Link href="/shop" className="more-card">
              <ProductMedia product={duo} sizes="140px" />
              <div className="c">
                <div className="eyebrow">{duo.audience}</div>
                <div className="n">{duo.name}</div>
                <div className="p">{formatPrice(duo.price)}</div>
                <div className="link-arrow">View <Arrow stroke="#9B6B66" w={12} /></div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { ShopGrid } from "./ShopGrid";

export const metadata: Metadata = { title: "Shop" };

export default function ShopPage() {
  return (
    <div className="wrap">
      <section className="page-head">
        <div className="eyebrow">The Collection</div>
        <h1 className="h1">Shop MIJAB</h1>
        <p className="lead" style={{ marginTop: 18, maxWidth: 480 }}>Two fragrances, designed for him and for her. Choose one, or take the pair.</p>
      </section>
      <ShopGrid />
    </div>
  );
}

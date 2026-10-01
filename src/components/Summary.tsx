import { formatPrice } from "@/lib/products";

export function SummaryRows({ subtotal, discount, delivery, total, promo }: { subtotal: number; discount: number; delivery: number; total: number; promo?: string | null }) {
  return (
    <div>
      <div className="sum-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
      {discount > 0 && <div className="sum-row"><span>Promo {promo}</span><span>− {formatPrice(discount)}</span></div>}
      <div className="sum-row"><span>Delivery</span><span>{formatPrice(delivery)}</span></div>
      <div className="sum-total"><span className="l">Total</span><span className="r">{formatPrice(total)}</span></div>
    </div>
  );
}

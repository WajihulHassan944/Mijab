import { formatPrice } from "@/lib/products";

export function SummaryRows({ subtotal, discount, delivery, total, promo, deliveryLabel }: { subtotal: number; discount: number; delivery: number; total: number; promo?: string | null; deliveryLabel?: string }) {
  return (
    <div>
      <div className="sum-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
      {discount > 0 && <div className="sum-row"><span>Promo {promo}</span><span>− {formatPrice(discount)}</span></div>}
      <div className="sum-row"><span>{deliveryLabel ?? "Delivery"}</span><span>{deliveryLabel && delivery === 0 ? "Free" : formatPrice(delivery)}</span></div>
      <div className="sum-total"><span className="l">Total</span><span className="r">{formatPrice(total)}</span></div>
    </div>
  );
}

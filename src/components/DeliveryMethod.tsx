"use client";

import { formatPrice } from "@/lib/products";
import { useStore } from "@/lib/store";

/** Home delivery vs store pickup. The choice lives in the store, so the bag
 * page and checkout always agree (and it's remembered between visits). */
export function DeliveryMethod({ compact = false }: { compact?: boolean }) {
  const { settings, fulfillment, setFulfillment, homeDeliveryFee } = useStore();
  const name = compact ? "ship-bag" : "ship";

  return (
    <div className={`stack${compact ? " ship-compact" : ""}`} style={{ gap: compact ? 8 : 10 }} role="radiogroup" aria-label="Delivery method">
      <label className={`radio${fulfillment === "delivery" ? " on" : ""}`}>
        <input type="radio" name={name} checked={fulfillment === "delivery"} onChange={() => setFulfillment("delivery")} />
        <span style={{ flex: 1 }}><b>Home delivery</b><small>Delivered to your door</small></span>
        <span className="radio-price">{homeDeliveryFee === 0 ? "Free" : formatPrice(homeDeliveryFee)}</span>
      </label>
      {settings.pickup && (
        <label className={`radio${fulfillment === "pickup" ? " on" : ""}`}>
          <input type="radio" name={name} checked={fulfillment === "pickup"} onChange={() => setFulfillment("pickup")} />
          <span style={{ flex: 1 }}><b>Store pickup</b><small>{compact ? "No delivery fee" : "Collect it yourself — no delivery fee"}</small></span>
          <span className="radio-price">Free</span>
        </label>
      )}
    </div>
  );
}

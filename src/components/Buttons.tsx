"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProductId } from "@/lib/products";
import { useStore } from "@/lib/store";
import { Arrow } from "./Icons";

/** Adds a product to the bag, then (by default) opens the bag. */
export function AddToBag({
  id,
  qty = 1,
  label = "Add to bag",
  className = "btn",
  go = "/bag",
  arrow,
}: {
  id: ProductId;
  qty?: number;
  label?: string;
  className?: string;
  go?: string | null;
  arrow?: boolean;
}) {
  const { add } = useStore();
  const router = useRouter();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        add(id, qty);
        if (go) router.push(go);
        else {
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        }
      }}
    >
      {done ? "Added to bag" : label}
      {arrow && !done && <Arrow />}
    </button>
  );
}

export function QtyStepper({ value, onChange, min = 1 }: { value: number; onChange: (n: number) => void; min?: number }) {
  return (
    <div className="qty">
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span aria-live="polite">{value}</span>
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(Math.min(10, value + 1))}>+</button>
    </div>
  );
}

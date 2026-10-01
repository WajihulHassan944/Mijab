import { PROMO_CODES } from "./products";

export const ADMIN_KEY = "mijab:admin:v1";

type AdminSaved = {
  promos?: { code: string; percent: number; active: boolean }[];
  stages?: Record<string, number | "cancelled">;
};

function readAdmin(): AdminSaved {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_KEY) ?? "{}") as AdminSaved;
  } catch {
    return {};
  }
}

/** Discount rate (0.1 = 10%) for a promo code. Admin-managed codes override the built-in ones. */
export function promoRate(code: string): number {
  const c = code.trim().toUpperCase();
  if (typeof window !== "undefined") {
    const found = readAdmin().promos?.find((p) => p.code === c);
    if (found) return found.active ? found.percent / 100 : 0;
  }
  return PROMO_CODES[c] ?? 0;
}

/** Order status overrides set from the admin panel (so tracking reflects them). */
export function readStages(): Record<string, number | "cancelled"> {
  return typeof window === "undefined" ? {} : readAdmin().stages ?? {};
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DELIVERY_FEE, Product, ProductId, products as staticProducts } from "./products";
import { Catalog, fetchCatalog } from "./catalog";
import { api, ApiOrder, PublicSettings, tokenStore } from "./api";

export type { Catalog } from "./catalog";

export type Line = { id: ProductId; qty: number };

// A line within a *placed* order carries the name/price as they were at the
// moment of purchase (the backend snapshots these), so a receipt always
// shows what was actually charged even if the catalog price changes later.
export type OrderLine = { id: ProductId; qty: number; name: string; price: number };

const FALLBACK_SETTINGS: PublicSettings = { storeName: "MIJAB", deliveryFee: DELIVERY_FEE, freeOver: 0, cod: true, card: true, bank: true };

export type Order = {
  id: string;
  placedOn: string;
  createdAt?: string;
  stage: 0 | 1 | 2 | 3; // 0 placed, 1 packed, 2 out for delivery, 3 delivered
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  name: string;
  address: string;
  city: string;
  email: string;
  phone: string;
  payment: string;
  paymentStatus: "not_required" | "pending" | "paid" | "failed";
};

export type User = { name: string; email: string; address?: string; phone?: string; city?: string };

const CART_KEY = "mijab:cart";

// Redirecting to Safepay's hosted checkout and back is a full page
// navigation, which wipes React/context state — a guest's just-placed order
// would otherwise vanish. This tiny localStorage handoff survives that trip
// so the confirmation page can look the order back up (by its own phone
// number, the same way /track does) once Safepay sends the customer back.
const PENDING_PAYMENT_KEY = "mijab:pending-payment";

export function savePendingPaymentHandoff(order: { id: string; phone: string }) {
  try {
    localStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify({ id: order.id, phone: order.phone }));
  } catch {
    /* storage unavailable — confirmation page just won't have this fallback */
  }
}

export function readPendingPaymentHandoff(): { id: string; phone: string } | null {
  try {
    const raw = localStorage.getItem(PENDING_PAYMENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPendingPaymentHandoff() {
  try {
    localStorage.removeItem(PENDING_PAYMENT_KEY);
  } catch {
    /* ignore */
  }
}

export function fromApi(o: ApiOrder): Order {
  return {
    id: o.id,
    placedOn: o.placedOn,
    createdAt: o.createdAt,
    stage: o.stage,
    lines: o.lines.map((l) => ({ id: l.id as ProductId, qty: l.qty, name: l.name, price: l.price })),
    subtotal: o.subtotal,
    discount: o.discount,
    delivery: o.delivery,
    total: o.total,
    name: o.name,
    address: o.address,
    city: o.city,
    email: o.email,
    phone: o.phone,
    payment: o.payment,
    paymentStatus: o.paymentStatus ?? "not_required",
  };
}

function toUser(u: { name: string; email: string; address?: string; phone?: string; city?: string }): User {
  return { name: u.name, email: u.email, address: u.address, phone: u.phone, city: u.city };
}

type Totals = { subtotal: number; discount: number; delivery: number; total: number };

/** Client-side estimate for the bag/checkout summary, from live catalog
 * prices and live delivery settings. The backend always recomputes
 * authoritative totals from the database at order time regardless. */
export function computeTotals(lines: Line[], catalog: Catalog, promoPercent: number, settings: PublicSettings): Totals {
  const subtotal = lines.reduce((sum, l) => sum + (catalog[l.id]?.price ?? 0) * l.qty, 0);
  const discount = Math.round(subtotal * (promoPercent / 100));
  let delivery = lines.length ? settings.deliveryFee : 0;
  if (lines.length && settings.freeOver > 0 && subtotal >= settings.freeOver) delivery = 0;
  return { subtotal, discount, delivery, total: subtotal - discount + delivery };
}

type Result = { ok: true } | { ok: false; error: string };

type Ctx = {
  ready: boolean;
  cart: Line[];
  count: number;
  promo: string | null;
  totals: Totals;
  products: Catalog;
  productList: Product[];
  fragrances: Product[];
  settings: PublicSettings;
  user: User | null;
  orders: Order[];
  lastOrder: Order | null;
  add: (id: ProductId, qty?: number) => void;
  setQty: (id: ProductId, qty: number) => void;
  remove: (id: ProductId) => void;
  applyPromo: (code: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<Result>;
  register: (name: string, email: string, password: string) => Promise<Result>;
  signOut: () => void;
  updateUser: (patch: Partial<Pick<User, "name" | "email" | "address" | "phone" | "city">>) => Promise<Result>;
  placeOrder: (details: { name: string; address: string; city: string; email: string; phone: string; payment: string }) => Promise<{ ok: true; order: Order } | { ok: false; error: string }>;
  findOrder: (id: string, phone: string) => Promise<Order | null>;
};

const StoreContext = createContext<Ctx | null>(null);

const errorMessage = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [cart, setCart] = useState<Line[]>([
    { id: "cafe-noir", qty: 1 },
    { id: "vanilla-gourmand", qty: 1 },
  ]);
  const [promo, setPromo] = useState<string | null>(null);
  const [promoPercent, setPromoPercent] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  // seeded from the static catalog so there's no empty-state flash while the
  // live fetch is in flight; replaced with live data (price, stock,
  // description, ...) as soon as it resolves, so admin edits always win
  const [products, setProducts] = useState<Catalog>(staticProducts);
  const [settings, setSettings] = useState<PublicSettings>(FALLBACK_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = localStorage.getItem(CART_KEY);
        if (raw) setCart(JSON.parse(raw));
      } catch {
        /* storage unavailable: cart just starts at the default */
      }

      const [catalog, settingsResult] = await Promise.allSettled([fetchCatalog(), api.settings.get()]);
      if (!cancelled) {
        if (catalog.status === "fulfilled") setProducts(catalog.value);
        if (settingsResult.status === "fulfilled") setSettings(settingsResult.value);
      }

      const token = tokenStore.get();
      if (token) {
        try {
          const apiUser = await api.auth.me(token);
          const mine = await api.orders.mine(token);
          if (!cancelled) {
            setUser(toUser(apiUser));
            setOrders(mine.map(fromApi));
          }
        } catch {
          tokenStore.set(null); // stale or expired token
        }
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* storage unavailable: the cart still works for this session */
    }
  }, [cart, ready]);

  const add = useCallback((id: ProductId, qty = 1) => {
    setCart((cur) => {
      const found = cur.find((l) => l.id === id);
      return found ? cur.map((l) => (l.id === id ? { ...l, qty: Math.min(10, l.qty + qty) } : l)) : [...cur, { id, qty }];
    });
  }, []);

  const setQty = useCallback((id: ProductId, qty: number) => {
    setCart((cur) =>
      cur.map((l) => (l.id === id ? { ...l, qty: Math.max(0, Math.min(10, qty)) } : l)).filter((l) => l.qty > 0),
    );
  }, []);

  const remove = useCallback((id: ProductId) => setCart((cur) => cur.filter((l) => l.id !== id)), []);

  const applyPromo = useCallback(async (code: string) => {
    const c = code.trim();
    if (!c) return false;
    try {
      const res = await api.promos.validate(c);
      if (res.valid && res.percent) {
        setPromo(res.code ?? c.toUpperCase());
        setPromoPercent(res.percent);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<Result> => {
    try {
      const res = await api.auth.login({ email, password });
      tokenStore.set(res.token);
      setUser(toUser(res.user));
      const mine = await api.orders.mine(res.token).catch(() => []);
      setOrders(mine.map(fromApi));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errorMessage(e, "Sign in failed") };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<Result> => {
    try {
      const res = await api.auth.register({ name, email, password });
      tokenStore.set(res.token);
      setUser(toUser(res.user));
      // the backend matches /orders/mine by email too, so any guest order
      // placed under this address before signing up shows up immediately
      const mine = await api.orders.mine(res.token).catch(() => []);
      setOrders(mine.map(fromApi));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errorMessage(e, "Could not create your account") };
    }
  }, []);

  const signOut = useCallback(() => {
    tokenStore.set(null);
    setUser(null);
    setOrders([]);
  }, []);

  const updateUser = useCallback(async (patch: Partial<Pick<User, "name" | "email" | "address" | "phone" | "city">>): Promise<Result> => {
    const token = tokenStore.get();
    if (!token) return { ok: false, error: "Please sign in again" };
    try {
      const res = await api.auth.update(token, patch);
      setUser(toUser(res));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errorMessage(e, "Could not save changes") };
    }
  }, []);

  const placeOrder = useCallback(
    async (details: { name: string; address: string; city: string; email: string; phone: string; payment: string }) => {
      try {
        const token = tokenStore.get();
        const order = await api.orders.place(token, {
          lines: cart.map((l) => ({ productId: l.id, qty: l.qty })),
          promoCode: promo ?? undefined,
          ...details,
        });
        const mapped = fromApi(order);
        setLastOrder(mapped);
        setOrders((cur) => [mapped, ...cur]);
        setCart([]);
        setPromo(null);
        setPromoPercent(0);
        return { ok: true as const, order: mapped };
      } catch (e) {
        return { ok: false as const, error: errorMessage(e, "Could not place your order") };
      }
    },
    [cart, promo],
  );

  const findOrder = useCallback(async (id: string, phone: string) => {
    try {
      const order = await api.orders.track(id.trim(), phone.trim());
      return fromApi(order);
    } catch {
      return null;
    }
  }, []);

  const count = cart.reduce((n, l) => n + l.qty, 0);
  const totals = useMemo(() => computeTotals(cart, products, promoPercent, settings), [cart, products, promoPercent, settings]);
  const productList = useMemo(() => Object.values(products), [products]);
  const fragrances = useMemo(() => productList.filter((p) => p.id !== "duo"), [productList]);

  const value: Ctx = {
    ready,
    cart,
    count,
    promo,
    totals,
    products,
    productList,
    fragrances,
    settings,
    user,
    orders,
    lastOrder,
    add,
    setQty,
    remove,
    applyPromo,
    login,
    register,
    signOut,
    updateUser,
    placeOrder,
    findOrder,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

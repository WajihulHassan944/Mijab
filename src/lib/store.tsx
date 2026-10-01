"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { DELIVERY_FEE, PROMO_CODES, ProductId, products } from "./products";

export type Line = { id: ProductId; qty: number };

export type Order = {
  id: string;
  placedOn: string;
  stage: 0 | 1 | 2 | 3; // 0 placed, 1 packed, 2 out for delivery, 3 delivered
  lines: Line[];
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
};

export type User = { name: string; email: string; address?: string };

type State = {
  ready: boolean;
  cart: Line[];
  promo: string | null;
  user: User | null;
  placed: Order[];
  lastOrderId: string | null;
};

type Action =
  | { type: "load"; state: Partial<State> }
  | { type: "add"; id: ProductId; qty: number }
  | { type: "setQty"; id: ProductId; qty: number }
  | { type: "remove"; id: ProductId }
  | { type: "promo"; code: string | null }
  | { type: "signIn"; user: User }
  | { type: "signOut" }
  | { type: "updateUser"; patch: Partial<User> }
  | { type: "place"; order: Order };

const KEY = "mijab:v1";

export const SEED_ORDERS: Order[] = [
  {
    id: "MJB-10482",
    placedOn: "1 October 2026",
    stage: 2,
    lines: [
      { id: "cafe-noir", qty: 1 },
      { id: "vanilla-gourmand", qty: 1 },
    ],
    subtotal: 5000,
    discount: 0,
    delivery: DELIVERY_FEE,
    total: 5200,
    name: "Ayesha Khan",
    address: "House 12, Street 4, F-7",
    city: "Islamabad, Pakistan",
    email: "ayesha@example.com",
    phone: "0300 0000000",
    payment: "Cash on delivery",
  },
  {
    id: "MJB-10311",
    placedOn: "12 September 2026",
    stage: 3,
    lines: [{ id: "cafe-noir", qty: 1 }],
    subtotal: 2500,
    discount: 0,
    delivery: DELIVERY_FEE,
    total: 2700,
    name: "Ayesha Khan",
    address: "House 12, Street 4, F-7",
    city: "Islamabad, Pakistan",
    email: "ayesha@example.com",
    phone: "0300 0000000",
    payment: "Cash on delivery",
  },
];

const initial: State = {
  ready: false,
  cart: [
    { id: "cafe-noir", qty: 1 },
    { id: "vanilla-gourmand", qty: 1 },
  ],
  promo: null,
  user: null,
  placed: [],
  lastOrderId: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load":
      return { ...state, ...action.state, ready: true };
    case "add": {
      const found = state.cart.find((l) => l.id === action.id);
      const cart = found
        ? state.cart.map((l) => (l.id === action.id ? { ...l, qty: Math.min(10, l.qty + action.qty) } : l))
        : [...state.cart, { id: action.id, qty: action.qty }];
      return { ...state, cart };
    }
    case "setQty":
      return {
        ...state,
        cart: state.cart
          .map((l) => (l.id === action.id ? { ...l, qty: Math.max(0, Math.min(10, action.qty)) } : l))
          .filter((l) => l.qty > 0),
      };
    case "remove":
      return { ...state, cart: state.cart.filter((l) => l.id !== action.id) };
    case "promo":
      return { ...state, promo: action.code };
    case "signIn":
      return { ...state, user: action.user };
    case "signOut":
      return { ...state, user: null };
    case "updateUser":
      return state.user ? { ...state, user: { ...state.user, ...action.patch } } : state;
    case "place":
      return { ...state, cart: [], promo: null, placed: [action.order, ...state.placed], lastOrderId: action.order.id };
  }
}

type Totals = { subtotal: number; discount: number; delivery: number; total: number };

export function computeTotals(lines: Line[], promo: string | null): Totals {
  const subtotal = lines.reduce((sum, l) => sum + products[l.id].price * l.qty, 0);
  const rate = promo ? PROMO_CODES[promo] ?? 0 : 0;
  const discount = Math.round(subtotal * rate);
  const delivery = lines.length ? DELIVERY_FEE : 0;
  return { subtotal, discount, delivery, total: subtotal - discount + delivery };
}

type Ctx = {
  ready: boolean;
  cart: Line[];
  count: number;
  promo: string | null;
  totals: Totals;
  user: User | null;
  orders: Order[];
  lastOrder: Order;
  add: (id: ProductId, qty?: number) => void;
  setQty: (id: ProductId, qty: number) => void;
  remove: (id: ProductId) => void;
  applyPromo: (code: string) => boolean;
  signIn: (user: User) => void;
  signOut: () => void;
  updateUser: (patch: Partial<User>) => void;
  placeOrder: (details: Omit<Order, "id" | "placedOn" | "stage" | "lines" | "subtotal" | "discount" | "delivery" | "total">) => Order;
  findOrder: (id: string, phone: string) => Order | null;
};

const StoreContext = createContext<Ctx | null>(null);

const digits = (s: string) => s.replace(/\D/g, "");

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<State>;
        dispatch({ type: "load", state: { cart: saved.cart, promo: saved.promo ?? null, user: saved.user ?? null, placed: saved.placed ?? [], lastOrderId: saved.lastOrderId ?? null } });
      } else {
        dispatch({ type: "load", state: {} });
      }
    } catch {
      dispatch({ type: "load", state: {} });
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!state.ready) return;
    try {
      const { cart, promo, user, placed, lastOrderId } = state;
      localStorage.setItem(KEY, JSON.stringify({ cart, promo, user, placed, lastOrderId }));
    } catch {
      /* storage unavailable: the mock still works for this session */
    }
  }, [state]);

  const orders = useMemo(() => [...state.placed, ...SEED_ORDERS], [state.placed]);
  const totals = useMemo(() => computeTotals(state.cart, state.promo), [state.cart, state.promo]);
  const count = state.cart.reduce((n, l) => n + l.qty, 0);
  const lastOrder = orders.find((o) => o.id === state.lastOrderId) ?? SEED_ORDERS[0];

  const add = useCallback((id: ProductId, qty = 1) => dispatch({ type: "add", id, qty }), []);
  const setQty = useCallback((id: ProductId, qty: number) => dispatch({ type: "setQty", id, qty }), []);
  const remove = useCallback((id: ProductId) => dispatch({ type: "remove", id }), []);
  const applyPromo = useCallback((code: string) => {
    const c = code.trim().toUpperCase();
    if (c in PROMO_CODES) {
      dispatch({ type: "promo", code: c });
      return true;
    }
    return false;
  }, []);
  const signIn = useCallback((user: User) => dispatch({ type: "signIn", user }), []);
  const signOut = useCallback(() => dispatch({ type: "signOut" }), []);
  const updateUser = useCallback((patch: Partial<User>) => dispatch({ type: "updateUser", patch }), []);

  const placeOrder: Ctx["placeOrder"] = useCallback(
    (details) => {
      const t = computeTotals(state.cart, state.promo);
      const order: Order = {
        ...details,
        id: `MJB-${10483 + state.placed.length}`,
        placedOn: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
        stage: 0,
        lines: state.cart,
        ...t,
      };
      dispatch({ type: "place", order });
      return order;
    },
    [state.cart, state.promo, state.placed.length],
  );

  const findOrder = useCallback(
    (id: string, phone: string) => {
      const wanted = id.trim().toUpperCase();
      const match = orders.find((o) => o.id === wanted);
      if (!match) return null;
      return digits(match.phone) === digits(phone) ? match : null;
    },
    [orders],
  );

  const value: Ctx = {
    ready: state.ready,
    cart: state.cart,
    count,
    promo: state.promo,
    totals,
    user: state.user,
    orders,
    lastOrder,
    add,
    setQty,
    remove,
    applyPromo,
    signIn,
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

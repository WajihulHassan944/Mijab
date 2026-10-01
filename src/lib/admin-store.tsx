"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  AdminOrder,
  AdminProduct,
  Customer,
  Message,
  Promo,
  Settings,
  Status,
  STATUS_FLOW,
  defaultSettings,
  deriveCustomers,
  seedMessages,
  seedOrders,
  seedProducts,
  seedPromos,
  stageToStatus,
} from "./admin-data";
import { ADMIN_KEY } from "./promos";
import { Order, SEED_ORDERS } from "./store";

export const ADMIN_EMAIL = "admin@mijab.com";
export const ADMIN_PASSWORD = "admin123";

type Saved = {
  auth: boolean;
  stages: Record<string, number | "cancelled">;
  notes: Record<string, string>;
  products: AdminProduct[] | null;
  promos: Promo[] | null;
  msg: Record<string, { state: Message["state"]; reply?: string }>;
  msgDeleted: string[];
  settings: Settings;
};

const blank: Saved = { auth: false, stages: {}, notes: {}, products: null, promos: null, msg: {}, msgDeleted: [], settings: defaultSettings };

type Ctx = {
  ready: boolean;
  authed: boolean;
  today: Date;
  orders: AdminOrder[];
  customers: Customer[];
  products: AdminProduct[];
  promos: Promo[];
  messages: Message[];
  settings: Settings;
  notes: Record<string, string>;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setStatus: (ids: string[], status: Status) => void;
  setNote: (id: string, note: string) => void;
  updateProduct: (id: string, patch: Partial<AdminProduct>) => void;
  addPromo: (p: Promo) => void;
  updatePromo: (code: string, patch: Partial<Promo>) => void;
  deletePromo: (code: string) => void;
  markMessage: (id: string, state: Message["state"], reply?: string) => void;
  deleteMessage: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetDemo: () => void;
};

const AdminContext = createContext<Ctx | null>(null);

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<Saved>(blank);
  const [placed, setPlaced] = useState<Order[]>([]);
  const [incoming, setIncoming] = useState<Omit<Message, "state">[]>([]);
  const [today, setToday] = useState(() => new Date("2026-10-01T12:00:00Z"));

  useEffect(() => {
    const load = () => {
      setSaved({ ...blank, ...readJSON<Partial<Saved>>(ADMIN_KEY, {}) });
      setPlaced(readJSON<{ placed?: Order[] }>("mijab:v1", {}).placed ?? []);
      setIncoming(readJSON<Omit<Message, "state">[]>("mijab:messages", []));
      setToday(new Date(Math.max(Date.now(), Date.parse("2026-10-01T12:00:00Z"))));
      setReady(true);
    };
    load();
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, []);

  const persist = useCallback((fn: (s: Saved) => Saved) => {
    setSaved((cur) => {
      const next = fn(cur);
      try {
        localStorage.setItem(ADMIN_KEY, JSON.stringify(next));
      } catch {
        /* demo data only */
      }
      return next;
    });
  }, []);

  const orders = useMemo<AdminOrder[]>(() => {
    const base = seedOrders(today, SEED_ORDERS);
    const mine: AdminOrder[] = placed.map((o) => ({ ...o, createdAt: o.createdAt ?? new Date().toISOString(), status: stageToStatus(o.stage) }));
    return [...base, ...mine]
      .map((o) => {
        const st = saved.stages[o.id];
        if (st === "cancelled") return { ...o, status: "cancelled" as Status };
        if (typeof st === "number") return { ...o, stage: st as Order["stage"], status: stageToStatus(st) };
        return o;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [today, placed, saved.stages]);

  const customers = useMemo(() => deriveCustomers(orders), [orders]);
  const products = saved.products ?? seedProducts();
  const promos = saved.promos ?? seedPromos();

  const messages = useMemo<Message[]>(() => {
    const all: Message[] = [...incoming.map((m) => ({ ...m, state: "unread" as const })), ...seedMessages(today)];
    return all
      .filter((m) => !saved.msgDeleted.includes(m.id))
      .map((m) => ({ ...m, ...(saved.msg[m.id] ?? {}) }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [incoming, today, saved.msg, saved.msgDeleted]);

  const value: Ctx = {
    ready,
    authed: saved.auth,
    today,
    orders,
    customers,
    products,
    promos,
    messages,
    settings: saved.settings,
    notes: saved.notes,
    login: (email, password) => {
      const ok = email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
      if (ok) persist((s) => ({ ...s, auth: true }));
      return ok;
    },
    logout: () => persist((s) => ({ ...s, auth: false })),
    setStatus: (ids, status) =>
      persist((s) => {
        const stages = { ...s.stages };
        ids.forEach((id) => {
          stages[id] = status === "cancelled" ? "cancelled" : STATUS_FLOW.indexOf(status);
        });
        return { ...s, stages };
      }),
    setNote: (id, note) => persist((s) => ({ ...s, notes: { ...s.notes, [id]: note } })),
    updateProduct: (id, patch) => persist((s) => ({ ...s, products: (s.products ?? seedProducts()).map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
    addPromo: (p) => persist((s) => ({ ...s, promos: [p, ...(s.promos ?? seedPromos())] })),
    updatePromo: (code, patch) => persist((s) => ({ ...s, promos: (s.promos ?? seedPromos()).map((p) => (p.code === code ? { ...p, ...patch } : p)) })),
    deletePromo: (code) => persist((s) => ({ ...s, promos: (s.promos ?? seedPromos()).filter((p) => p.code !== code) })),
    markMessage: (id, state, reply) => persist((s) => ({ ...s, msg: { ...s.msg, [id]: { state, reply: reply ?? s.msg[id]?.reply } } })),
    deleteMessage: (id) => persist((s) => ({ ...s, msgDeleted: [...s.msgDeleted, id] })),
    updateSettings: (patch) => persist((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
    resetDemo: () => persist((s) => ({ ...blank, auth: s.auth })),
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}

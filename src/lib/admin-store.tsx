"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  AdminOrder,
  AdminProduct,
  Customer,
  Message,
  Promo,
  Settings,
  Status,
} from "./admin-data";
import { api, ApiMessage, ApiOrder, ApiProduct, ApiSettings, tokenStore } from "./api";
import { getPusher } from "./pusher-client";

function toAdminOrder(o: ApiOrder): AdminOrder {
  return {
    id: o.id,
    placedOn: o.placedOn,
    createdAt: o.createdAt,
    stage: o.stage,
    status: o.status,
    lines: o.lines.map((l) => ({ id: l.id as AdminOrder["lines"][number]["id"], qty: l.qty, name: l.name, price: l.price })),
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
    note: o.note,
  };
}

function toAdminProduct(p: ApiProduct): AdminProduct {
  return {
    id: p.slug,
    name: p.name,
    sku: p.sku,
    price: p.price,
    compareAt: p.compareAt,
    stock: p.stock,
    active: p.active,
    description: p.description,
    top: p.notes?.top ?? "",
    heart: p.notes?.heart ?? "",
    base: p.notes?.base ?? "",
    image: p.image,
    swatch: p.swatch,
    audience: p.audience,
  };
}

function toMessage(m: ApiMessage): Message {
  return { id: m._id, name: m.name, email: m.email, subject: m.subject, body: m.body, createdAt: m.createdAt, state: m.state, reply: m.reply };
}

function toSettings(s: ApiSettings): Settings {
  return { ...s };
}

const FALLBACK_SETTINGS: Settings = {
  storeName: "MIJAB",
  email: "hello@mijab.com",
  phone: "",
  deliveryFee: 200,
  freeOver: 0,
  cod: true,
  card: true,
  bank: true,
  notifyOrders: true,
  notifyLowStock: true,
  notifyMessages: false,
  lowStockAt: 10,
};

type AdminUser = { name: string; email: string };

type Ctx = {
  ready: boolean;
  authed: boolean;
  admin: AdminUser | null;
  today: Date;
  orders: AdminOrder[];
  customers: Customer[];
  products: AdminProduct[];
  promos: Promo[];
  messages: Message[];
  settings: Settings;
  notes: Record<string, string>;
  login: (email: string, password: string) => Promise<boolean>;
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
};

const AdminContext = createContext<Ctx | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [today] = useState(() => new Date());
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<Settings>(FALLBACK_SETTINGS);

  const loadAll = useCallback(async (token: string) => {
    const [ordersRes, customersRes, productsRes, promosRes, messagesRes, settingsRes] = await Promise.all([
      api.admin.orders.list(token, { limit: 200 }),
      api.admin.customers.list(token),
      api.admin.products.list(token),
      api.admin.promos.list(token),
      api.admin.messages.list(token),
      api.admin.settings.get(token),
    ]);
    setOrders(ordersRes.orders.map(toAdminOrder));
    setCustomers(customersRes);
    setProducts(productsRes.map(toAdminProduct));
    setPromos(promosRes);
    setMessages(messagesRes.map(toMessage));
    setSettings(toSettings(settingsRes));
  }, []);

  const refreshOrdersAndCustomers = useCallback(async (token: string) => {
    const [ordersRes, customersRes] = await Promise.all([api.admin.orders.list(token, { limit: 200 }), api.admin.customers.list(token)]);
    setOrders(ordersRes.orders.map(toAdminOrder));
    setCustomers(customersRes);
  }, []);

  useEffect(() => {
    (async () => {
      const token = tokenStore.getAdmin();
      if (token) {
        try {
          const user = await api.admin.auth.me(token);
          setAdmin({ name: user.name, email: user.email });
          setAuthed(true);
          await loadAll(token);
        } catch {
          tokenStore.setAdmin(null);
        }
      }
      setReady(true);
    })();
  }, [loadAll]);

  // Realtime: new orders / new contact messages land on the "mijab-admin" channel.
  const authedRef = useRef(authed);
  authedRef.current = authed;
  useEffect(() => {
    if (!authed) return;
    const pusher = getPusher();
    if (!pusher) return;
    const channel = pusher.subscribe("mijab-admin");

    const onNewOrder = (payload: ApiOrder) => setOrders((cur) => (cur.some((o) => o.id === payload.id) ? cur : [toAdminOrder(payload), ...cur]));
    const onNewMessage = (payload: Message) => setMessages((cur) => (cur.some((m) => m.id === payload.id) ? cur : [payload, ...cur]));

    channel.bind("order:new", onNewOrder);
    channel.bind("message:new", onNewMessage);
    return () => {
      channel.unbind("order:new", onNewOrder);
      channel.unbind("message:new", onNewMessage);
      pusher.unsubscribe("mijab-admin");
    };
  }, [authed]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await api.admin.auth.login({ email, password });
        tokenStore.setAdmin(res.token);
        setAdmin({ name: res.user.name, email: res.user.email });
        setAuthed(true);
        await loadAll(res.token);
        return true;
      } catch {
        return false;
      }
    },
    [loadAll],
  );

  const logout = useCallback(() => {
    tokenStore.setAdmin(null);
    setAuthed(false);
    setAdmin(null);
  }, []);

  const setStatus = useCallback((ids: string[], status: Status) => {
    const token = tokenStore.getAdmin();
    if (!token) return;
    api.admin.orders
      .setStatus(token, ids, status)
      .then((updated) => {
        setOrders((cur) => cur.map((o) => {
          const match = updated.find((u) => u.id === o.id);
          return match ? toAdminOrder(match) : o;
        }));
        // customer spend/order counts depend on order status, so refresh those too
        refreshOrdersAndCustomers(token).catch(() => {});
      })
      .catch((e) => console.error("setStatus failed:", e));
  }, [refreshOrdersAndCustomers]);

  const setNote = useCallback((id: string, note: string) => {
    const token = tokenStore.getAdmin();
    if (!token) return;
    api.admin.orders
      .update(token, id, { note })
      .then((updated) => setOrders((cur) => cur.map((o) => (o.id === id ? toAdminOrder(updated) : o))))
      .catch((e) => console.error("setNote failed:", e));
  }, []);

  const updateProduct = useCallback((id: string, patch: Partial<AdminProduct>) => {
    const token = tokenStore.getAdmin();
    if (!token) return;
    const { top, heart, base, id: _drop, ...rest } = patch;
    void _drop;
    const body: Partial<ApiProduct> & { slug?: never } = { ...rest };
    if (top !== undefined || heart !== undefined || base !== undefined) {
      (body as Record<string, unknown>).notes = {
        ...(top !== undefined ? { top } : {}),
        ...(heart !== undefined ? { heart } : {}),
        ...(base !== undefined ? { base } : {}),
      };
    }
    api.admin.products
      .update(token, id, body)
      .then((updated) => setProducts((cur) => cur.map((p) => (p.id === id ? toAdminProduct(updated) : p))))
      .catch((e) => console.error("updateProduct failed:", e));
  }, []);

  const addPromo = useCallback((p: Promo) => {
    const token = tokenStore.getAdmin();
    if (!token) return;
    api.admin.promos
      .create(token, { code: p.code, percent: p.percent, active: p.active, note: p.note })
      .then((created) => setPromos((cur) => [created, ...cur]))
      .catch((e) => console.error("addPromo failed:", e));
  }, []);

  const updatePromo = useCallback((code: string, patch: Partial<Promo>) => {
    const token = tokenStore.getAdmin();
    if (!token) return;
    api.admin.promos
      .update(token, code, patch)
      .then((updated) => setPromos((cur) => cur.map((p) => (p.code === code ? updated : p))))
      .catch((e) => console.error("updatePromo failed:", e));
  }, []);

  const deletePromo = useCallback((code: string) => {
    const token = tokenStore.getAdmin();
    if (!token) return;
    api.admin.promos
      .remove(token, code)
      .then(() => setPromos((cur) => cur.filter((p) => p.code !== code)))
      .catch((e) => console.error("deletePromo failed:", e));
  }, []);

  const markMessage = useCallback((id: string, state: Message["state"], reply?: string) => {
    const token = tokenStore.getAdmin();
    if (!token) return;
    api.admin.messages
      .update(token, id, { state, reply })
      .then((updated) => setMessages((cur) => cur.map((m) => (m.id === id ? toMessage(updated) : m))))
      .catch((e) => console.error("markMessage failed:", e));
  }, []);

  const deleteMessage = useCallback((id: string) => {
    const token = tokenStore.getAdmin();
    if (!token) return;
    api.admin.messages
      .remove(token, id)
      .then(() => setMessages((cur) => cur.filter((m) => m.id !== id)))
      .catch((e) => console.error("deleteMessage failed:", e));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    const token = tokenStore.getAdmin();
    if (!token) return;
    api.admin.settings
      .update(token, patch)
      .then((updated) => setSettings(toSettings(updated)))
      .catch((e) => console.error("updateSettings failed:", e));
  }, []);

  const notes = useMemo(() => Object.fromEntries(orders.map((o) => [o.id, o.note ?? ""])), [orders]);

  const value: Ctx = {
    ready,
    authed,
    admin,
    today,
    orders,
    customers,
    products,
    promos,
    messages,
    settings,
    notes,
    login,
    logout,
    setStatus,
    setNote,
    updateProduct,
    addPromo,
    updatePromo,
    deletePromo,
    markMessage,
    deleteMessage,
    updateSettings,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}

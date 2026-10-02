// Thin client for the MIJAB backend (see mijab-backend repo). Every call
// returns the parsed JSON body; on a non-2xx response it throws an ApiError
// with the server's message so callers can show it to the user.

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  status: number;
  details?: string[];
  constructor(message: string, status: number, details?: string[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const TOKEN_KEY = "mijab:token";
const ADMIN_TOKEN_KEY = "mijab:admin-token";

function readToken(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeToken(key: string, token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(key, token);
    else localStorage.removeItem(key);
  } catch {
    /* storage unavailable */
  }
}

export const tokenStore = {
  get: () => readToken(TOKEN_KEY),
  set: (t: string | null) => writeToken(TOKEN_KEY, t),
  getAdmin: () => readToken(ADMIN_TOKEN_KEY),
  setAdmin: (t: string | null) => writeToken(ADMIN_TOKEN_KEY, t),
};

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  raw?: boolean; // return the Response instead of parsing JSON (e.g. CSV export)
};

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (opts.raw) return res as unknown as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new ApiError(data.error ?? `Request failed (${res.status})`, res.status, data.details);
  }
  return data as T;
}

// ---- Types mirroring the backend's public shapes ----

export type ApiProduct = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  audience: string;
  tagline: string;
  blurb: string;
  description: string;
  price: number;
  compareAt?: number;
  image: string;
  swatch: string;
  bag: string;
  bagLabel: string;
  bottle: string;
  notes: { top: string; heart: string; base: string };
  stock: number;
  active: boolean;
};

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  role: "customer" | "admin";
};

export type ApiOrderLine = { id: string; qty: number; name: string; price: number };

export type ApiOrder = {
  id: string;
  placedOn: string;
  createdAt: string;
  stage: 0 | 1 | 2 | 3;
  status: "placed" | "packed" | "out" | "delivered" | "cancelled";
  lines: ApiOrderLine[];
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  promoCode: string | null;
  name: string;
  address: string;
  city: string;
  email: string;
  phone: string;
  payment: string;
  paymentStatus?: "not_required" | "pending" | "paid" | "failed";
  note?: string;
};

export type ApiPromo = { code: string; percent: number; active: boolean; uses: number; note: string };

export type ApiMessage = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  state: "unread" | "read" | "replied";
  reply?: string;
  createdAt: string;
};

export type ApiSettings = {
  storeName: string;
  email: string;
  phone: string;
  deliveryFee: number;
  freeOver: number;
  cod: boolean;
  card: boolean;
  bank: boolean;
  notifyOrders: boolean;
  notifyLowStock: boolean;
  notifyMessages: boolean;
  lowStockAt: number;
};

export type ApiCustomer = { email: string; name: string; phone: string; city: string; orders: number; spent: number; first: string; last: string };

export type ApiAnalytics = {
  days: number;
  revenueByDay: { date: string; revenue: number; orders: number }[];
  totals: { revenue: number; orders: number; customers: number; averageOrderValue: number };
  byStatus: Record<"placed" | "packed" | "out" | "delivered" | "cancelled", number>;
  topProducts: { productId: string; name: string; qty: number; revenue: number }[];
  lowStockProducts: ApiProduct[];
  unreadMessages: number;
};

// ---- Public / customer endpoints ----

export type PublicSettings = { storeName: string; deliveryFee: number; freeOver: number; cod: boolean; card: boolean; bank: boolean };

export const api = {
  products: {
    list: () => request<{ products: ApiProduct[] }>("/products").then((r) => r.products),
    get: (slug: string) => request<{ product: ApiProduct }>(`/products/${slug}`).then((r) => r.product),
  },
  settings: {
    get: () => request<{ settings: PublicSettings }>("/settings").then((r) => r.settings),
  },
  auth: {
    register: (body: { name: string; email: string; password: string }) =>
      request<{ token: string; user: ApiUser }>("/auth/register", { method: "POST", body }),
    login: (body: { email: string; password: string }) =>
      request<{ token: string; user: ApiUser }>("/auth/login", { method: "POST", body }),
    me: (token: string) => request<{ user: ApiUser }>("/auth/me", { token }).then((r) => r.user),
    update: (token: string, patch: Partial<Pick<ApiUser, "name" | "email" | "phone" | "address" | "city">>) =>
      request<{ user: ApiUser }>("/auth/me", { method: "PATCH", body: patch, token }).then((r) => r.user),
  },
  orders: {
    place: (token: string | null, body: Record<string, unknown>) =>
      request<{ order: ApiOrder }>("/orders", { method: "POST", body, token }).then((r) => r.order),
    mine: (token: string) => request<{ orders: ApiOrder[] }>("/orders/mine", { token }).then((r) => r.orders),
    track: (id: string, phone: string) =>
      request<{ order: ApiOrder }>("/orders/track", { method: "POST", body: { id, phone } }).then((r) => r.order),
  },
  promos: {
    validate: (code: string) => request<{ valid: boolean; code?: string; percent?: number }>("/promos/validate", { method: "POST", body: { code } }),
  },
  contact: {
    submit: (body: { name: string; email: string; subject: string; body: string }) => request<{ id: string }>("/contact", { method: "POST", body }),
  },
  payments: {
    safepayCheckout: (orderId: string) => request<{ checkoutUrl: string }>("/payments/safepay/checkout", { method: "POST", body: { orderId } }).then((r) => r.checkoutUrl),
  },

  // ---- Admin ----
  admin: {
    auth: {
      login: (body: { email: string; password: string }) => request<{ token: string; user: ApiUser }>("/admin/auth/login", { method: "POST", body }),
      me: (token: string) => request<{ user: ApiUser }>("/admin/auth/me", { token }).then((r) => r.user),
    },
    orders: {
      list: (token: string, query: Record<string, string | number | undefined> = {}) => {
        const qs = new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined) as [string, string][]).toString();
        return request<{ orders: ApiOrder[]; page: number; limit: number; total: number; pages: number }>(`/admin/orders${qs ? `?${qs}` : ""}`, { token });
      },
      exportUrl: () => `${BASE}/admin/orders/export`,
      setStatus: (token: string, ids: string[], status: ApiOrder["status"]) =>
        request<{ orders: ApiOrder[] }>("/admin/orders/status", { method: "PATCH", body: { ids, status }, token }).then((r) => r.orders),
      update: (token: string, id: string, patch: { status?: ApiOrder["status"]; note?: string }) =>
        request<{ order: ApiOrder }>(`/admin/orders/${id}`, { method: "PATCH", body: patch, token }).then((r) => r.order),
    },
    products: {
      list: (token: string) => request<{ products: ApiProduct[] }>("/admin/products", { token }).then((r) => r.products),
      create: (token: string, body: Partial<ApiProduct>) => request<{ product: ApiProduct }>("/admin/products", { method: "POST", body, token }).then((r) => r.product),
      update: (token: string, id: string, patch: Partial<ApiProduct>) =>
        request<{ product: ApiProduct }>(`/admin/products/${id}`, { method: "PATCH", body: patch, token }).then((r) => r.product),
      remove: (token: string, id: string) => request<{ ok: true }>(`/admin/products/${id}`, { method: "DELETE", token }),
    },
    promos: {
      list: (token: string) => request<{ promos: ApiPromo[] }>("/admin/promos", { token }).then((r) => r.promos),
      create: (token: string, body: { code: string; percent: number; active?: boolean; note?: string }) =>
        request<{ promo: ApiPromo }>("/admin/promos", { method: "POST", body, token }).then((r) => r.promo),
      update: (token: string, code: string, patch: Partial<ApiPromo>) =>
        request<{ promo: ApiPromo }>(`/admin/promos/${code}`, { method: "PATCH", body: patch, token }).then((r) => r.promo),
      remove: (token: string, code: string) => request<{ ok: true }>(`/admin/promos/${code}`, { method: "DELETE", token }),
    },
    messages: {
      list: (token: string) => request<{ messages: ApiMessage[] }>("/admin/messages", { token }).then((r) => r.messages),
      update: (token: string, id: string, patch: { state?: ApiMessage["state"]; reply?: string }) =>
        request<{ message: ApiMessage }>(`/admin/messages/${id}`, { method: "PATCH", body: patch, token }).then((r) => r.message),
      remove: (token: string, id: string) => request<{ ok: true }>(`/admin/messages/${id}`, { method: "DELETE", token }),
    },
    customers: {
      list: (token: string) => request<{ customers: ApiCustomer[] }>("/admin/customers", { token }).then((r) => r.customers),
      get: (token: string, email: string) =>
        request<{ customer: ApiCustomer | null; orders: ApiOrder[] }>(`/admin/customers/${encodeURIComponent(email)}`, { token }),
    },
    settings: {
      get: (token: string) => request<{ settings: ApiSettings }>("/admin/settings", { token }).then((r) => r.settings),
      update: (token: string, patch: Partial<ApiSettings>) =>
        request<{ settings: ApiSettings }>("/admin/settings", { method: "PATCH", body: patch, token }).then((r) => r.settings),
    },
    analytics: {
      get: (token: string, days = 30) => request<{ analytics: ApiAnalytics }>(`/admin/analytics?days=${days}`, { token }).then((r) => r.analytics),
    },
  },
};

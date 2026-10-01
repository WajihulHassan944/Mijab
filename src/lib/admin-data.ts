import { DELIVERY_FEE, ProductId, products } from "./products";
import type { Line, Order } from "./store";

export type Status = "placed" | "packed" | "out" | "delivered" | "cancelled";
export const STATUS_LABEL: Record<Status, string> = {
  placed: "New",
  packed: "Packed",
  out: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
export const STATUS_FLOW: Status[] = ["placed", "packed", "out", "delivered"];
export const stageToStatus = (stage: number): Status => STATUS_FLOW[Math.max(0, Math.min(3, stage))];

export type AdminOrder = Omit<Order, "createdAt"> & { createdAt: string; status: Status };

export type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  createdAt: string;
  state: "unread" | "read" | "replied";
  reply?: string;
};

export type AdminProduct = {
  id: ProductId;
  name: string;
  sku: string;
  price: number;
  compareAt?: number;
  stock: number;
  active: boolean;
  description: string;
  top: string;
  heart: string;
  base: string;
};

export type Promo = { code: string; percent: number; active: boolean; uses: number; note: string };

export type Settings = {
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

export const defaultSettings: Settings = {
  storeName: "MIJAB",
  email: "hello@mijab.com",
  phone: "0300 0000000",
  deliveryFee: DELIVERY_FEE,
  freeOver: 0,
  cod: true,
  card: true,
  bank: true,
  notifyOrders: true,
  notifyLowStock: true,
  notifyMessages: false,
  lowStockAt: 10,
};

export const seedProducts = (): AdminProduct[] => [
  { id: "cafe-noir", name: "Café Noir", sku: "MJB-CN-50", price: 2500, stock: 64, active: true, description: products["cafe-noir"].description, ...products["cafe-noir"].notes! },
  { id: "vanilla-gourmand", name: "Vanilla Gourmand", sku: "MJB-VG-50", price: 2500, stock: 8, active: true, description: products["vanilla-gourmand"].description, ...products["vanilla-gourmand"].notes! },
  { id: "duo", name: "The Duo", sku: "MJB-DUO-100", price: 4500, compareAt: 5000, stock: 31, active: true, description: products.duo.description, top: "Bergamot, Cardamom · Pear, Pink Pepper", heart: "Roasted Coffee, Leather · Vanilla Orchid, Praline", base: "Tonka Bean · Sandalwood" },
];

export const seedPromos = (): Promo[] => [
  { code: "WELCOME10", percent: 10, active: true, uses: 18, note: "First order welcome offer" },
  { code: "MIJAB10", percent: 10, active: true, uses: 7, note: "Instagram giveaway" },
  { code: "EID20", percent: 20, active: false, uses: 41, note: "Eid campaign (ended)" },
];

const daysAgo = (anchor: Date, d: number, h = 12) => {
  const t = new Date(anchor);
  t.setUTCDate(t.getUTCDate() - d);
  t.setUTCHours(h, (d * 7) % 60, 0, 0);
  return t.toISOString();
};

export const seedMessages = (anchor: Date): Message[] => [
  { id: "m1", name: "Hira Malik", email: "hira.malik@example.com", subject: "Question about an order", body: "Hi, I placed an order two days ago and haven't had a dispatch email yet. Could you check MJB-10477?", createdAt: daysAgo(anchor, 0, 7), state: "unread" },
  { id: "m2", name: "Usman Tariq", email: "usman.t@example.com", subject: "Wholesale or gifting", body: "We are planning corporate gifts for 40 people this Eid. Do you offer bulk pricing on the Duo?", createdAt: daysAgo(anchor, 1, 15), state: "unread" },
  { id: "m3", name: "Sana Rauf", email: "sana.rauf@example.com", subject: "Product advice", body: "Is Vanilla Gourmand very sweet? I usually prefer lighter florals.", createdAt: daysAgo(anchor, 3, 11), state: "replied", reply: "Hi Sana, it opens with pear and pink pepper so the vanilla comes in softly. Happy to send a sample size if you'd like." },
  { id: "m4", name: "Bilal Ahmed", email: "bilal.ahmed@example.com", subject: "Something else", body: "Love the packaging! Do you ship outside Pakistan?", createdAt: daysAgo(anchor, 5, 9), state: "read" },
  { id: "m5", name: "Mehwish Noor", email: "mehwish.n@example.com", subject: "Question about an order", body: "Can I change the delivery address on my order? I'm moving flats this week.", createdAt: daysAgo(anchor, 8, 16), state: "replied", reply: "Of course, we've updated the address on your order." },
];

const FIRST = ["Ayesha", "Hira", "Usman", "Sana", "Bilal", "Mehwish", "Zain", "Fatima", "Ali", "Noor", "Hamza", "Maryam", "Omar", "Iqra", "Danish", "Rabia", "Saad", "Laiba", "Farhan", "Amna"];
const LAST = ["Khan", "Malik", "Tariq", "Rauf", "Ahmed", "Noor", "Siddiqui", "Sheikh", "Ali", "Butt", "Chaudhry", "Raza", "Hussain", "Javed", "Qureshi"];
const CITIES: [string, string][] = [
  ["Islamabad", "Islamabad Capital Territory"],
  ["Lahore", "Punjab"],
  ["Karachi", "Sindh"],
  ["Rawalpindi", "Punjab"],
  ["Faisalabad", "Punjab"],
  ["Peshawar", "Khyber Pakhtunkhwa"],
  ["Multan", "Punjab"],
];
const PAY = ["Cash on delivery", "Cash on delivery", "Cash on delivery", "Debit or credit card", "Bank transfer"];
const STREETS = ["House 12, Street 4, F-7", "Flat 8, Gulberg III", "House 221, Block C, DHA Phase 5", "Apartment 5B, Clifton", "House 40, Sector G-11", "Plot 9, Model Town"];

/** Deterministic pseudo-random sequence so the demo data is stable between loads. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** About 90 days of believable order history, anchored to `anchor` (today). */
export function seedOrders(anchor: Date, fixed: Order[]): AdminOrder[] {
  const r = rng(20261001);
  const out: AdminOrder[] = [];
  let n = 10312;
  for (let d = 89; d >= 1; d--) {
    const count = d > 60 ? Math.floor(r() * 2) : d > 30 ? Math.floor(r() * 3) : 1 + Math.floor(r() * 3);
    for (let k = 0; k < count; k++) {
      const fn = FIRST[Math.floor(r() * FIRST.length)];
      const ln = LAST[Math.floor(r() * LAST.length)];
      const [city, prov] = CITIES[Math.floor(r() * CITIES.length)];
      const roll = r();
      const lines: Line[] = roll < 0.4 ? [{ id: "cafe-noir", qty: 1 }] : roll < 0.7 ? [{ id: "vanilla-gourmand", qty: 1 }] : roll < 0.9 ? [{ id: "duo", qty: 1 }] : [{ id: "cafe-noir", qty: 1 }, { id: "vanilla-gourmand", qty: 1 }];
      if (r() < 0.12) lines[0] = { ...lines[0], qty: 2 };
      const subtotal = lines.reduce((s, l) => s + products[l.id].price * l.qty, 0);
      const discount = r() < 0.18 ? Math.round(subtotal * 0.1) : 0;
      const status: Status = d > 6 ? (r() < 0.05 ? "cancelled" : "delivered") : d > 3 ? (r() < 0.6 ? "delivered" : "out") : d > 1 ? (r() < 0.5 ? "out" : "packed") : "placed";
      const id = `MJB-${n++}`;
      const email = `${fn}.${ln}@example.com`.toLowerCase();
      out.push({
        id,
        placedOn: new Date(daysAgo(anchor, d)).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
        createdAt: daysAgo(anchor, d, 8 + Math.floor(r() * 12)),
        stage: Math.max(0, STATUS_FLOW.indexOf(status)) as Order["stage"],
        status,
        lines,
        subtotal,
        discount,
        delivery: DELIVERY_FEE,
        total: subtotal - discount + DELIVERY_FEE,
        name: `${fn} ${ln}`,
        address: STREETS[Math.floor(r() * STREETS.length)],
        city: `${city}, ${prov}`,
        email,
        phone: `03${Math.floor(r() * 5)}${Math.floor(1000000 + r() * 8999999)}`,
        payment: PAY[Math.floor(r() * PAY.length)],
      });
    }
  }
  const fixedAdmin: AdminOrder[] = fixed.map((o) => ({ ...o, createdAt: o.createdAt ?? new Date().toISOString(), status: stageToStatus(o.stage) }));
  return [...out, ...fixedAdmin];
}

export type Customer = { email: string; name: string; phone: string; city: string; orders: number; spent: number; first: string; last: string };

export function deriveCustomers(orders: AdminOrder[]): Customer[] {
  const map = new Map<string, Customer>();
  for (const o of [...orders].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    const key = o.email.toLowerCase();
    const cur = map.get(key) ?? { email: o.email, name: o.name, phone: o.phone, city: o.city.split(",")[0], orders: 0, spent: 0, first: o.createdAt, last: o.createdAt };
    cur.last = o.createdAt;
    if (o.status !== "cancelled") {
      cur.orders += 1;
      cur.spent += o.total;
    }
    map.set(key, cur);
  }
  return [...map.values()].filter((c) => c.orders > 0).sort((a, b) => b.spent - a.spent);
}

export const money = (n: number) => `Rs. ${Math.round(n).toLocaleString("en-US")}`;
export const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
export const longDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
export const dayKey = (iso: string) => iso.slice(0, 10);

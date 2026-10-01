import type { Order } from "./store";

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

export type AdminOrder = Omit<Order, "createdAt"> & { createdAt: string; status: Status; note?: string };

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
  id: string;
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

export type Customer = { email: string; name: string; phone: string; city: string; orders: number; spent: number; first: string; last: string };

export const money = (n: number) => `Rs. ${Math.round(n).toLocaleString("en-US")}`;
export const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
export const longDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
export const dayKey = (iso: string) => iso.slice(0, 10);

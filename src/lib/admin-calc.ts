import { AdminOrder, dayKey } from "./admin-data";

export const live = (orders: AdminOrder[]) => orders.filter((o) => o.status !== "cancelled");

export function inRange(orders: AdminOrder[], today: Date, fromDaysAgo: number, toDaysAgo = 0) {
  const end = new Date(today);
  end.setUTCDate(end.getUTCDate() - toDaysAgo);
  end.setUTCHours(23, 59, 59, 999);
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - fromDaysAgo + 1);
  start.setUTCHours(0, 0, 0, 0);
  return orders.filter((o) => {
    const t = Date.parse(o.createdAt);
    return t >= start.getTime() && t <= end.getTime();
  });
}

export const sum = (orders: AdminOrder[]) => orders.reduce((s, o) => s + o.total, 0);

export function pctChange(now: number, before: number): number | null {
  if (!before) return now ? 100 : null;
  return ((now - before) / before) * 100;
}

/** One bucket per day for the last `days` days (oldest first). */
export function byDay(orders: AdminOrder[], today: Date, days: number) {
  const out: { key: string; label: string; revenue: number; orders: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ key, label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }), revenue: 0, orders: 0 });
  }
  const idx = new Map(out.map((b, i) => [b.key, i]));
  for (const o of orders) {
    const i = idx.get(dayKey(o.createdAt));
    if (i !== undefined) {
      out[i].revenue += o.total;
      out[i].orders += 1;
    }
  }
  return out;
}

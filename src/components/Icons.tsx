type P = { size?: number; stroke?: string; width?: number };
const base = (p: P) => ({
  width: p.size ?? 22,
  height: p.size ?? 22,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: p.stroke ?? "#2A1D18",
  strokeWidth: p.width ?? 1.3,
  "aria-hidden": true,
});

export const SearchIcon = (p: P) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
);
export const AccountIcon = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></svg>
);
export const BagIcon = (p: P) => (
  <svg {...base(p)}><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" /></svg>
);
export const HomeIcon = (p: P) => (
  <svg {...base(p)}><path d="M4 11l8-7 8 7v9H4z" /><path d="M10 20v-6h4v6" /></svg>
);
export const ShopIcon = (p: P) => (
  <svg {...base(p)}><path d="M8 3h8v4H8z" /><path d="M6 7h12v14H6z" /></svg>
);
export const ChevronDown = (p: P) => (
  <svg {...base(p)}><path d="M6 9l6 6 6-6" /></svg>
);
export const ChevronLeft = (p: P) => (
  <svg {...base(p)}><path d="M15 5l-7 7 7 7" /></svg>
);
export const Check = (p: P) => (
  <svg {...base(p)}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const Lock = (p: P) => (
  <svg {...base(p)}><rect x="5" y="11" width="14" height="9" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
);
export const Truck = (p: P) => (
  <svg {...base(p)}><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" /><circle cx="7" cy="17.5" r="1.5" /><circle cx="17" cy="17.5" r="1.5" /></svg>
);
export const Gift = (p: P) => (
  <svg {...base(p)}><rect x="4" y="9" width="16" height="11" /><path d="M12 9v11M4 13h16M12 9c-3 0-4-4-1-4s1 4 1 4zm0 0c3 0 4-4 1-4s-1 4-1 4z" /></svg>
);
export const Mail = (p: P) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="14" /><path d="M3 7l9 7 9-7" /></svg>
);
export const Instagram = (p: P) => (
  <svg {...base({ size: 18, stroke: "#F0E4DC", ...p })}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill={p.stroke ?? "#F0E4DC"} /></svg>
);
export const TikTok = (p: P) => (
  <svg {...base({ size: 18, stroke: "#F0E4DC", ...p })}><path d="M14 3v11.5a3.5 3.5 0 11-3.5-3.5M14 3c.4 2.6 2 4.2 5 4.5" /></svg>
);
export const Facebook = (p: P) => (
  <svg {...base({ size: 18, stroke: "#F0E4DC", ...p })}><path d="M14 8h3V4h-3a4 4 0 00-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5A.5.5 0 0114 8z" /></svg>
);
export const Arrow = ({ stroke = "currentColor", w = 14 }: { stroke?: string; w?: number }) => (
  <svg className="arrow" width={w} height={(w * 8) / 14} viewBox="0 0 22 10" fill="none" stroke={stroke} strokeWidth="1.4" aria-hidden>
    <path d="M0 5h21M17 1l4 4-4 4" />
  </svg>
);

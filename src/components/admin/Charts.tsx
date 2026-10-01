"use client";

import { useState } from "react";

const INK = "#2a1d18";
const ROSE = "#9b6b66";
const LILAC = "#b9a0cf";
const SAND = "#d9c6bc";

/** Bars with hover tooltip. */
export function BarChart({ data, height = 220, format = (n: number) => String(n), color = INK }: { data: { label: string; value: number; sub?: string }[]; height?: number; format?: (n: number) => string; color?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const W = 640;
  const H = height;
  const pad = { l: 8, r: 8, t: 14, b: 26 };
  const bw = (W - pad.l - pad.r) / data.length;
  const step = Math.ceil(data.length / 8);
  return (
    <div className="chart" style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Bar chart" style={{ display: "block" }}>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line key={g} x1={pad.l} x2={W - pad.r} y1={pad.t + (H - pad.t - pad.b) * (1 - g)} y2={pad.t + (H - pad.t - pad.b) * (1 - g)} stroke="#eadfd8" strokeWidth="1" />
        ))}
        {data.map((d, i) => {
          const h = ((H - pad.t - pad.b) * d.value) / max;
          const x = pad.l + i * bw + bw * 0.15;
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={pad.l + i * bw} y={pad.t} width={bw} height={H - pad.t - pad.b} fill="transparent" />
              <rect x={x} y={pad.t + (H - pad.t - pad.b) - h} width={bw * 0.7} height={Math.max(h, d.value ? 2 : 0)} fill={hover === i ? ROSE : color} rx="1.5" />
              {i % step === 0 && (
                <text x={pad.l + i * bw + bw / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="#8f7d73">
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="chart-tip" style={{ left: `${((hover + 0.5) / data.length) * 100}%` }}>
          <b>{format(data[hover].value)}</b>
          <span>{data[hover].sub ?? data[hover].label}</span>
        </div>
      )}
    </div>
  );
}

/** Smooth area line chart. */
export function LineChart({ data, height = 220, format = (n: number) => String(n) }: { data: { label: string; value: number }[]; height?: number; format?: (n: number) => string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const W = 640;
  const H = height;
  const pad = { l: 8, r: 8, t: 14, b: 26 };
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, data.length - 1);
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1)} ${H - pad.b} L${x(0)} ${H - pad.b} Z`;
  const step = Math.ceil(data.length / 8);
  return (
    <div className="chart" style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Line chart" style={{ display: "block" }} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="lg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={ROSE} stopOpacity="0.28" /><stop offset="100%" stopColor={ROSE} stopOpacity="0" /></linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((g) => (<line key={g} x1={pad.l} x2={W - pad.r} y1={pad.t + (H - pad.t - pad.b) * (1 - g)} y2={pad.t + (H - pad.t - pad.b) * (1 - g)} stroke="#eadfd8" />))}
        <path d={area} fill="url(#lg)" />
        <path d={line} fill="none" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={i} onMouseEnter={() => setHover(i)}>
            <rect x={x(i) - (W / data.length) / 2} y={0} width={W / data.length} height={H} fill="transparent" />
            {hover === i && <circle cx={x(i)} cy={y(d.value)} r="4" fill={INK} />}
            {i % step === 0 && (<text x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#8f7d73">{d.label}</text>)}
          </g>
        ))}
      </svg>
      {hover !== null && (
        <div className="chart-tip" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <b>{format(data[hover].value)}</b>
          <span>{data[hover].label}</span>
        </div>
      )}
    </div>
  );
}

const PALETTE = [INK, ROSE, LILAC, SAND, "#6b5a52"];

export function Donut({ data, size = 160 }: { data: { label: string; value: number }[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 56;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 160 160" width={size} height={size} role="img" aria-label="Donut chart">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#f0e6df" strokeWidth="22" />
        {data.map((d, i) => {
          const len = (d.value / total) * c;
          const el = (
            <circle key={d.label} cx="80" cy="80" r={r} fill="none" stroke={PALETTE[i % PALETTE.length]} strokeWidth="22" strokeDasharray={`${Math.max(len - 1.5, 0)} ${c}`} strokeDashoffset={-acc} transform="rotate(-90 80 80)" />
          );
          acc += len;
          return el;
        })}
        <text x="80" y="78" textAnchor="middle" fontSize="22" fontFamily="var(--serif)" fill={INK}>{total}</text>
        <text x="80" y="96" textAnchor="middle" fontSize="9" letterSpacing="1.5" fill="#8f7d73">TOTAL</text>
      </svg>
      <ul className="legend">
        {data.map((d, i) => (
          <li key={d.label}><i style={{ background: PALETTE[i % PALETTE.length] }} />{d.label}<b>{d.value}</b></li>
        ))}
      </ul>
    </div>
  );
}

export function HBars({ data, format = (n: number) => String(n) }: { data: { label: string; value: number; sub?: string }[]; format?: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="hbars">
      {data.map((d) => (
        <li key={d.label}>
          <div className="hb-top"><span>{d.label}</span><b>{format(d.value)}</b></div>
          <div className="hb-track"><div className="hb-fill" style={{ width: `${(d.value / max) * 100}%` }} /></div>
          {d.sub && <small>{d.sub}</small>}
        </li>
      ))}
    </ul>
  );
}

export function Sparkline({ values, color = INK }: { values: number[]; color?: string }) {
  const max = Math.max(1, ...values);
  const W = 90, H = 28;
  const pts = values.map((v, i) => `${(i * W) / Math.max(1, values.length - 1)},${H - (v / max) * (H - 4) - 2}`).join(" ");
  return (<svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /></svg>);
}

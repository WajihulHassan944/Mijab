import Link from "next/link";
import { STATUS_LABEL, Status } from "@/lib/admin-data";
import { IArrowDown, IArrowUp } from "./AIcons";

export function PageHeader({ title, sub, children, back }: { title: string; sub?: string; children?: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="ph">
      <div>
        {back && <Link href={back.href} className="ph-back">← {back.label}</Link>}
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className="ph-actions">{children}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`pill s-${status}`}>{STATUS_LABEL[status]}</span>;
}

export function Stat({ label, value, delta, hint }: { label: string; value: string; delta?: number | null; hint?: string }) {
  return (
    <div className="stat">
      <div className="stat-l">{label}</div>
      <div className="stat-v">{value}</div>
      <div className="stat-f">
        {delta != null && (
          <span className={`delta ${delta >= 0 ? "up" : "down"}`}>
            {delta >= 0 ? <IArrowUp size={12} /> : <IArrowDown size={12} />}
            {Math.abs(delta).toFixed(0)}%
          </span>
        )}
        {hint && <small>{hint}</small>}
      </div>
    </div>
  );
}

export function Card({ title, action, children, flush }: { title?: string; action?: React.ReactNode; children: React.ReactNode; flush?: boolean }) {
  return (
    <section className="acard">
      {(title || action) && (
        <header className="acard-h">
          {title && <h2>{title}</h2>}
          {action}
        </header>
      )}
      <div className={flush ? "acard-b flush" : "acard-b"}>{children}</div>
    </section>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={`tog${on ? " on" : ""}`} onClick={() => onChange(!on)}>
      <i />
    </button>
  );
}

export function download(name: string, text: string, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

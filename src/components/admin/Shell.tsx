"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Logo } from "../Logo";
import { useAdmin } from "@/lib/admin-store";
import { IChart, IClose, IDash, IExt, IGear, IMail, IMenu, IOrders, IOut, IProducts, ISearch, ITag, IUsers } from "./AIcons";

const nav = [
  { href: "/admin", label: "Dashboard", icon: IDash },
  { href: "/admin/orders", label: "Orders", icon: IOrders, badge: "orders" as const },
  { href: "/admin/products", label: "Products", icon: IProducts },
  { href: "/admin/customers", label: "Customers", icon: IUsers },
  { href: "/admin/promotions", label: "Promotions", icon: ITag },
  { href: "/admin/messages", label: "Messages", icon: IMail, badge: "messages" as const },
  { href: "/admin/analytics", label: "Analytics", icon: IChart },
  { href: "/admin/settings", label: "Settings", icon: IGear },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, authed, admin, orders, messages, logout } = useAdmin();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const isLogin = pathname === "/admin/login";

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (ready && !authed && !isLogin) router.replace("/admin/login");
    if (ready && authed && isLogin) router.replace("/admin");
  }, [ready, authed, isLogin, router]);

  if (isLogin) return <div className="adm adm-login">{children}</div>;
  if (!ready || !authed) return <div className="adm adm-loading" aria-busy="true" />;

  const counts = { orders: orders.filter((o) => o.status === "placed").length, messages: messages.filter((m) => m.state === "unread").length };
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="adm">
      <aside className={`adm-side${open ? " open" : ""}`}>
        <div className="adm-brand">
          <Link href="/admin" aria-label="MIJAB admin"><Logo width={92} title="MIJAB" /></Link>
          <span>Admin</span>
          <button className="adm-x" onClick={() => setOpen(false)} aria-label="Close menu"><IClose /></button>
        </div>
        <nav aria-label="Admin">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={active(n.href) ? "on" : ""} aria-current={active(n.href) ? "page" : undefined}>
              <n.icon />
              <span>{n.label}</span>
              {n.badge && counts[n.badge] > 0 && <em>{counts[n.badge]}</em>}
            </Link>
          ))}
        </nav>
        <div className="adm-side-foot">
          <Link href="/" target="_blank"><IExt /> View store</Link>
          <button onClick={() => { logout(); router.push("/admin/login"); }}><IOut /> Sign out</button>
        </div>
      </aside>
      {open && <div className="adm-scrim" onClick={() => setOpen(false)} />}
      <div className="adm-main">
        <header className="adm-top">
          <button className="adm-burger" onClick={() => setOpen(true)} aria-label="Open menu"><IMenu /></button>
          <form className="adm-search" onSubmit={(e) => { e.preventDefault(); router.push(`/admin/orders?q=${encodeURIComponent(q)}`); }} role="search">
            <ISearch size={16} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search orders by number, name or email" aria-label="Search orders" />
          </form>
          <div className="adm-me"><span className="avatar">{admin?.name?.[0]?.toUpperCase() ?? "A"}</span><div><b>{admin?.name ?? "Admin"}</b><small>{admin?.email}</small></div></div>
        </header>
        <main className="adm-content">{children}</main>
      </div>
    </div>
  );
}

export function LoginForm() {
  const { login } = useAdmin();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const ok = await login(email, pass);
    setBusy(false);
    if (ok) router.replace("/admin");
    else setErr("Invalid email or password.");
  }

  return (
    <div className="login-card">
      <Logo width={120} title="MIJAB" />
      <div className="eyebrow" style={{ marginTop: 22 }}>Admin panel</div>
      <h1>Sign in</h1>
      <form onSubmit={submit} className="stack" style={{ marginTop: 22 }} noValidate>
        <div className="field"><label htmlFor="a-email">Email</label><input id="a-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></div>
        <div className="field"><label htmlFor="a-pass">Password</label><input id="a-pass" className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" /></div>
        {err && <div className="err-text" role="alert">{err}</div>}
        <button className="btn" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}

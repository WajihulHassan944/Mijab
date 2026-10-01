"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Arrow } from "@/components/Icons";
import { useStore } from "@/lib/store";

export default function SignInPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const { signIn } = useStore();
  const router = useRouter();

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if (pass.length < 1) return setError("Enter your password.");
    if (mode === "up" && !name.trim()) return setError("Tell us your name.");
    const local = email.split("@")[0].replace(/[._-]+/g, " ");
    const display = mode === "up" ? name.trim() : local.replace(/\b\w/g, (c) => c.toUpperCase());
    signIn({ name: display, email });
    router.push("/account");
  }

  return (
    <section className="signin">
      <div className="signin-art">
        <Image src="/images/petal.jpg" alt="Soft pink petal" fill sizes="420px" priority />
        <div className="q">It&apos;s a feeling. It&apos;s you.</div>
      </div>
      <div className="signin-form">
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={mode === "in"} className={mode === "in" ? "on" : ""} onClick={() => { setMode("in"); setError(""); }}>Sign in</button>
          <button role="tab" aria-selected={mode === "up"} className={mode === "up" ? "on" : ""} onClick={() => { setMode("up"); setError(""); }}>Create account</button>
        </div>
        <h1>{mode === "in" ? "Welcome back" : "Join MIJAB"}</h1>
        <p className="lead" style={{ marginTop: 8 }}>{mode === "in" ? "Sign in to view your orders and check out faster." : "Create an account to track orders and check out faster."}</p>

        <form onSubmit={submit} className="stack" style={{ marginTop: 28 }} noValidate>
          {mode === "up" && (
            <div className="field"><label htmlFor="si-name">Full name</label><input id="si-name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
          )}
          <div className="field"><label htmlFor="si-email">Email</label><input id="si-email" className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
          <div className="field"><label htmlFor="si-pass">Password</label><input id="si-pass" className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} /></div>
          {mode === "in" && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, fontWeight: 300 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="checkbox" style={{ accentColor: "#2A1D18", width: 16, height: 16, margin: 0 }} /> Keep me signed in</label>
              <a href="#" style={{ color: "var(--rose)" }}>Forgot password?</a>
            </div>
          )}
          {error && <div className="err-text" role="alert">{error}</div>}
          <button type="submit" className="btn" style={{ marginTop: 8 }}>{mode === "in" ? "Sign in" : "Create account"} <Arrow stroke="#F6EAE2" /></button>
        </form>
        <div className="or">or</div>
        <Link href="/checkout" className="btn-outline">Continue as guest</Link>
        <p className="hint">Demo store: any email and password will sign you in.</p>
      </div>
    </section>
  );
}

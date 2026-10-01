"use client";

import { FormEvent, useState } from "react";
import { IPlus, ITrash } from "@/components/admin/AIcons";
import { Card, PageHeader, Toggle } from "@/components/admin/UI";
import { useAdmin } from "@/lib/admin-store";

export default function PromotionsPage() {
  const { promos, addPromo, updatePromo, deletePromo } = useAdmin();
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("10");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase().replace(/\s+/g, "");
    const p = Number(percent);
    if (!/^[A-Z0-9]{3,16}$/.test(c)) return setErr("Use 3–16 letters or numbers.");
    if (!(p > 0 && p <= 90)) return setErr("Discount must be between 1% and 90%.");
    if (promos.some((x) => x.code === c)) return setErr("That code already exists.");
    addPromo({ code: c, percent: p, active: true, uses: 0, note: note.trim() });
    setCode(""); setNote(""); setErr("");
  }

  return (
    <>
      <PageHeader title="Promotions" sub="Discount codes customers can apply in their bag" />
      <div className="cols">
        <Card title="Discount codes" flush>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Code</th><th className="num">Discount</th><th className="num">Used</th><th>Active</th><th /></tr></thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p.code}>
                    <td><b style={{ letterSpacing: "0.1em" }}>{p.code}</b><span className="sub">{p.note || "—"}</span></td>
                    <td className="num">{p.percent}%</td>
                    <td className="num">{p.uses}</td>
                    <td><Toggle on={p.active} onChange={(v) => updatePromo(p.code, { active: v })} label={`${p.code} active`} /></td>
                    <td className="num"><button className="abtn danger sm" aria-label={`Delete ${p.code}`} onClick={() => confirm(`Delete ${p.code}?`) && deletePromo(p.code)}><ITrash size={14} /></button></td>
                  </tr>
                ))}
                {promos.length === 0 && <tr><td colSpan={5}><div className="empty-a">No codes yet.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="New code">
          <form className="agrid" onSubmit={submit} noValidate>
            <div className="afield"><label className="alabel" htmlFor="pc-code">Code</label><input id="pc-code" className="ain" placeholder="SUMMER15" value={code} onChange={(e) => setCode(e.target.value)} /></div>
            <div className="afield"><label className="alabel" htmlFor="pc-pct">Discount (%)</label><input id="pc-pct" className="ain" inputMode="numeric" value={percent} onChange={(e) => setPercent(e.target.value)} /></div>
            <div className="afield"><label className="alabel" htmlFor="pc-note">Note (optional)</label><input id="pc-note" className="ain" value={note} onChange={(e) => setNote(e.target.value)} /></div>
            {err && <div className="err-text" role="alert">{err}</div>}
            <button className="abtn" type="submit"><IPlus size={15} /> Create code</button>
          </form>
          <p className="inline-note" style={{ marginTop: 14 }}>Codes you create here work in the storefront bag on this device.</p>
        </Card>
      </div>
    </>
  );
}

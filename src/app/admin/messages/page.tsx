"use client";

import { useEffect, useState } from "react";
import { ITrash } from "@/components/admin/AIcons";
import { PageHeader } from "@/components/admin/UI";
import { longDate } from "@/lib/admin-data";
import { useAdmin } from "@/lib/admin-store";

export default function MessagesPage() {
  const { messages, markMessage, deleteMessage } = useAdmin();
  const [sel, setSel] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const list = messages.filter((m) => filter === "all" || m.state === "unread");
  const cur = messages.find((m) => m.id === sel) ?? null;

  useEffect(() => { if (!sel && list[0]) setSel(list[0].id); }, [list, sel]);
  useEffect(() => { setReply(""); if (cur && cur.state === "unread") markMessage(cur.id, "read"); }, [cur?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <PageHeader title="Messages" sub={`${messages.filter((m) => m.state === "unread").length} unread · from the storefront contact form`}>
        <div className="tabs-a">
          <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>All</button>
          <button className={filter === "unread" ? "on" : ""} onClick={() => setFilter("unread")}>Unread</button>
        </div>
      </PageHeader>
      <div className="inbox">
        <div className="inbox-list">
          {list.map((m) => (
            <button key={m.id} className={`inbox-item${sel === m.id ? " on" : ""}${m.state === "unread" ? " unread" : ""}`} onClick={() => setSel(m.id)}>
              <div className="top"><b>{m.name}</b><small>{longDate(m.createdAt)}</small></div>
              <small>{m.subject}</small>
              <p>{m.body}</p>
            </button>
          ))}
          {list.length === 0 && <div className="empty-a">Nothing here.</div>}
        </div>
        <div className="inbox-view">
          {cur ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div><div className="eyebrow">{cur.subject}</div><h2>{cur.name}</h2><small className="inline-note">{cur.email} · {longDate(cur.createdAt)}</small></div>
                <span className={`pill ${cur.state}`}>{cur.state}</span>
              </div>
              <div className="inbox-body">{cur.body}</div>
              {cur.reply && <div className="inbox-reply"><small className="inline-note">Your reply</small><br />{cur.reply}</div>}
              <div style={{ marginTop: 18 }}>
                <label className="alabel" htmlFor="reply">{cur.reply ? "Send another reply" : "Reply"}</label>
                <textarea id="reply" className="ata" placeholder={`Write to ${cur.name.split(" ")[0]}…`} value={reply} onChange={(e) => setReply(e.target.value)} />
                <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="abtn" disabled={!reply.trim()} onClick={() => { markMessage(cur.id, "replied", reply.trim()); setReply(""); }}>Send reply</button>
                  <a className="abtn ghost" href={`mailto:${cur.email}?subject=Re: ${encodeURIComponent(cur.subject)}`}>Open in email</a>
                  <button className="abtn danger" onClick={() => { deleteMessage(cur.id); setSel(null); }}><ITrash size={14} /> Delete</button>
                </div>
              </div>
            </>
          ) : <div className="empty-a">Select a message to read it.</div>}
        </div>
      </div>
    </>
  );
}

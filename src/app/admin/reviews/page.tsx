"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ICheck, IClose, ITrash } from "@/components/admin/AIcons";
import { PageHeader } from "@/components/admin/UI";
import { longDate } from "@/lib/admin-data";
import { api, ApiAdminReview, tokenStore } from "@/lib/api";

type Filter = "pending" | "approved" | "rejected" | "all";
const PILL: Record<ApiAdminReview["status"], string> = { pending: "warn", approved: "ok", rejected: "off" };
const LABEL: Record<ApiAdminReview["status"], string> = { pending: "Pending", approved: "On homepage", rejected: "Hidden" };

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ApiAdminReview[] | null>(null);
  const [filter, setFilter] = useState<Filter>("pending");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    const token = tokenStore.getAdmin();
    if (!token) return;
    api.admin.reviews
      .list(token)
      .then(setReviews)
      .catch(() => setError("Couldn't load reviews. Refresh to try again."));
  }, []);

  useEffect(load, [load]);

  function setStatus(id: string, status: ApiAdminReview["status"]) {
    const token = tokenStore.getAdmin();
    if (!token) return;
    api.admin.reviews
      .setStatus(token, id, status)
      .then((updated) => setReviews((cur) => cur?.map((r) => (r.id === id ? updated : r)) ?? null))
      .catch(() => setError("Couldn't update that review. Please try again."));
  }

  function remove(id: string) {
    const token = tokenStore.getAdmin();
    if (!token || !confirm("Delete this review permanently?")) return;
    api.admin.reviews
      .remove(token, id)
      .then(() => setReviews((cur) => cur?.filter((r) => r.id !== id) ?? null))
      .catch(() => setError("Couldn't delete that review. Please try again."));
  }

  const all = reviews ?? [];
  const count = (s: ApiAdminReview["status"]) => all.filter((r) => r.status === s).length;
  const list = filter === "all" ? all : all.filter((r) => r.status === filter);

  return (
    <>
      <PageHeader title="Reviews" sub={`${count("pending")} awaiting approval · only approved reviews appear on the homepage`}>
        <div className="tabs-a">
          <button className={filter === "pending" ? "on" : ""} onClick={() => setFilter("pending")}>Pending<small>{count("pending")}</small></button>
          <button className={filter === "approved" ? "on" : ""} onClick={() => setFilter("approved")}>Approved<small>{count("approved")}</small></button>
          <button className={filter === "rejected" ? "on" : ""} onClick={() => setFilter("rejected")}>Hidden<small>{count("rejected")}</small></button>
          <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>All<small>{all.length}</small></button>
        </div>
      </PageHeader>

      {error && <div className="err-text" role="alert" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="rv-list">
        {reviews === null && !error && <div className="empty-a">Loading reviews…</div>}
        {reviews !== null && list.length === 0 && (
          <div className="empty-a">
            {filter === "pending" ? "No reviews waiting for approval." : "Nothing here yet."}
            <br />
            <small className="inline-note">Customers can review an order once it&apos;s marked delivered. The delivery email includes a review link.</small>
          </div>
        )}
        {list.map((r) => (
          <article key={r.id} className="acard rv-item">
            <div className="rv-top">
              <div>
                <div className="rv-stars" aria-label={`${r.rating} out of 5 stars`}>{stars(r.rating)}</div>
                <b>{r.name}</b>
                <small className="inline-note">
                  {r.city && `${r.city} · `}
                  <Link href={`/admin/orders/${r.orderId}`} style={{ textDecoration: "underline" }}>{r.orderId}</Link> · {longDate(r.createdAt)}
                </small>
              </div>
              <span className={`pill ${PILL[r.status]}`}>{LABEL[r.status]}</span>
            </div>
            <p className="rv-body">{r.body}</p>
            {r.products.length > 0 && <small className="inline-note">Purchased: {r.products.join(", ")}</small>}
            <div className="rv-actions">
              {r.status !== "approved" && <button className="abtn sm" onClick={() => setStatus(r.id, "approved")}><ICheck size={14} /> Approve</button>}
              {r.status !== "rejected" && <button className="abtn ghost sm" onClick={() => setStatus(r.id, "rejected")}><IClose size={14} /> {r.status === "approved" ? "Hide from homepage" : "Reject"}</button>}
              <button className="abtn danger sm" onClick={() => remove(r.id)}><ITrash size={14} /> Delete</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

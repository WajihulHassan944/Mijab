"use client";

import { FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Arrow } from "../Icons";

/** Compact email sign-up used in the footer. Sends the request to the shop's inbox. */
export function NewsletterForm({ id = "lx-news" }: { id?: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!email) return;
    setError("");
    setState("busy");
    try {
      await api.contact.submit({
        name: "Newsletter subscriber",
        email,
        subject: "Newsletter sign-up",
        body: `Please add ${email} to the MIJAB mailing list for offers and new launches.`,
      });
      setState("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign you up. Please try again.");
      setState("idle");
    }
  }

  if (state === "done") return <p className="lx-news-done" role="status">Thank you, you&apos;re on the list.</p>;

  return (
    <>
      <form className="lx-news-form" onSubmit={submit}>
        <label className="sr-only" htmlFor={id}>Email address</label>
        <input id={id} name="email" type="email" placeholder="Enter your email" autoComplete="email" required />
        <button type="submit" aria-label="Subscribe" disabled={state === "busy"}>
          <Arrow stroke="#2a1d18" />
        </button>
      </form>
      {error && <p className="lx-news-err" role="alert">{error}</p>}
    </>
  );
}

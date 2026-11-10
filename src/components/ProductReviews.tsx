import type { ApiReview } from "@/lib/api";

function Stars({ value, label }: { value: number; label: string }) {
  return (
    <span className="pr-stars" role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" aria-hidden className={i <= Math.round(value) ? "on" : ""}>
          <path d="M12 2.6l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
        </svg>
      ))}
    </span>
  );
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Approved customer reviews for one product. Renders nothing until there is at
 * least one, and these are the same reviews the page's structured data lists. */
export function ProductReviews({ reviews, summary }: { reviews: ApiReview[]; summary?: { count: number; average: number } }) {
  if (!reviews.length) return null;
  const count = summary?.count ?? reviews.length;
  const average = summary?.average ?? reviews.reduce((t, r) => t + r.rating, 0) / reviews.length;
  return (
    <section className="pdp-reviews" id="reviews" aria-label="Customer reviews">
      <div className="pr-head">
        <div>
          <div className="eyebrow">Customer reviews</div>
          <h2>In their words</h2>
        </div>
        <div className="pr-score">
          <b>{average.toFixed(1)}</b>
          <Stars value={average} label={`Rated ${average.toFixed(1)} out of 5`} />
          <span>{count} {count === 1 ? "review" : "reviews"}</span>
        </div>
      </div>
      <div className="pr-list">
        {reviews.map((r) => (
          <article className="pr-item" key={r.id}>
            <Stars value={r.rating} label={`${r.rating} out of 5`} />
            <p>{r.body}</p>
            <div className="pr-by">{r.name}{r.city ? `, ${r.city}` : ""} · <time dateTime={r.createdAt}>{fmtDate(r.createdAt)}</time></div>
          </article>
        ))}
      </div>
    </section>
  );
}

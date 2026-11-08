import type { Metadata } from "next";
import { Suspense } from "react";
import { ReviewClient } from "./ReviewClient";

export const metadata: Metadata = { title: "Leave a review", robots: { index: false, follow: false } };

export default function ReviewPage() {
  return (
    <Suspense>
      <ReviewClient />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackClient } from "./TrackClient";

export const metadata: Metadata = {
  title: "Track order",
  description: "Track your MIJAB order with your order number.",
  alternates: { canonical: "/track" },
};

export default function TrackPage() {
  return (
    <Suspense>
      <TrackClient />
    </Suspense>
  );
}

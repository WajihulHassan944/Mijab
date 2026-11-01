import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MIJAB — Scent / Elegance / You",
    short_name: "MIJAB",
    description: "Premium eau de parfum from Pakistan. Café Noir for him, Vanilla Gourmand for her.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6EAE2",
    theme_color: "#141010",
    icons: [{ src: "/icon.png", sizes: "64x64", type: "image/png" }],
  };
}

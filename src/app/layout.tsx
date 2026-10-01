import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const sans = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "MIJAB — Scent / Elegance / You", template: "%s · MIJAB" },
  description: "More than just a scent. Two fragrances, Café Noir for him and Vanilla Gourmand for her.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#141010" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}

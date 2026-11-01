import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const sans = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-sans", display: "swap" });

const SITE_URL = "https://mijab.shop";
const SITE_NAME = "MIJAB";
const DEFAULT_DESCRIPTION =
  "MIJAB — premium eau de parfum from Pakistan. Café Noir for him, Vanilla Gourmand for her, and the signature Duo. Free delivery, cash on delivery available.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "MIJAB — Scent / Elegance / You", template: "%s · MIJAB" },
  description: DEFAULT_DESCRIPTION,
  keywords: ["MIJAB", "perfume Pakistan", "eau de parfum", "Café Noir", "Vanilla Gourmand", "fragrance for him", "fragrance for her", "luxury perfume Pakistan"],
  authors: [{ name: "MIJAB" }],
  creator: "MIJAB",
  publisher: "MIJAB",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "MIJAB — Scent / Elegance / You",
    description: DEFAULT_DESCRIPTION,
    locale: "en_US",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "MIJAB — Café Noir and Vanilla Gourmand" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MIJAB — Scent / Elegance / You",
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#141010" };

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MIJAB",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MIJAB",
  url: SITE_URL,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}

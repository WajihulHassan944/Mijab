import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { CONTACT_EMAIL, CONTACT_PHONE, INSTAGRAM_URL, SITE_NAME, SITE_URL } from "@/lib/site";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const sans = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-sans", display: "swap" });

const DEFAULT_DESCRIPTION =
  "MIJAB — premium eau de parfum from Pakistan. Café Noir for him, Vanilla Gourmand for her, and the signature Duo. Delivery across Pakistan, cash on delivery available.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "MIJAB — Scent / Elegance / You", template: "%s · MIJAB" },
  description: DEFAULT_DESCRIPTION,
  keywords: ["MIJAB", "perfume Pakistan", "eau de parfum", "Café Noir", "Vanilla Gourmand", "fragrance for him", "fragrance for her", "luxury perfume Pakistan"],
  authors: [{ name: "MIJAB" }],
  creator: "MIJAB",
  publisher: "MIJAB",
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

// OnlineStore, not a LocalBusiness: MIJAB sells online and delivers, with no
// shop to visit, so only the city is given (the street address stays private).
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: "MIJAB",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/og-image.jpg`,
  description: "Premium eau de parfum from Pakistan, delivered nationwide.",
  email: CONTACT_EMAIL,
  telephone: CONTACT_PHONE,
  address: { "@type": "PostalAddress", addressLocality: "Rawalpindi", addressRegion: "Punjab", postalCode: "44000", addressCountry: "PK" },
  areaServed: { "@type": "Country", name: "Pakistan" },
  contactPoint: { "@type": "ContactPoint", contactType: "customer service", telephone: CONTACT_PHONE, email: CONTACT_EMAIL, areaServed: "PK" },
  sameAs: [INSTAGRAM_URL],
  hasMerchantReturnPolicy: {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "PK",
    returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
  },
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

// The one public origin for canonicals, sitemap, Open Graph and structured data.
// Vercel serves www.mijab.shop and 308-redirects the bare domain to it, so every
// URL we hand to Google must use www, or the signals point at a redirect.
export const SITE_URL = "https://www.mijab.shop";
export const SITE_NAME = "MIJAB";

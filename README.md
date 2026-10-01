# MIJAB

Working mock storefront for MIJAB (Café Noir / Vanilla Gourmand), built in Next.js from the design canvas.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

Pages: `/` home, `/shop`, `/product/[cafe-noir|vanilla-gourmand]`, `/bag`, `/checkout`, `/confirmation`, `/track`, `/sign-in`, `/account`, `/about`, `/contact`. Every page is responsive (desktop and mobile layouts from the design).

It is a mock: the bag, sign-in, orders and tracking live in `localStorage` (see `src/lib/store.tsx`). Any email/password signs in; promo code `WELCOME10` gives 10% off; try tracking `MJB-10482` with `0300 0000000`.

## Admin panel

Open `/admin` and sign in with the demo login `admin@mijab.com` / `admin123`.

Pages: dashboard, orders (list, detail, bulk status, CSV export), products (list, edit), customers (list, detail), promotions, messages (storefront contact form inbox), analytics, settings.

Demo data is generated in `src/lib/admin-data.ts` and edits are kept in `localStorage` (see `src/lib/admin-store.tsx`). Order status changes, promo codes and contact messages are shared with the storefront in the same browser.

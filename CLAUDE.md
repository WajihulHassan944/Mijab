# MIJAB storefront

Production for mijab.shop deploys automatically from the `main` branch of this repo, so when work is ready to go live, commit and push it to `main` (not a `claude/*` branch) and don't use `vercel deploy --prod` from a local folder. Vercel doesn't build `claude/*` branches (see `vercel.json`), so work pushed only there never goes live.

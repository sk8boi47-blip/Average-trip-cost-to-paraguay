# Oliworx Arcade

Oliworx Arcade is a searchable directory of browser games. Each card opens the game's own website in a new tab; game availability and rules are controlled by that site and the visitor's network.

## GitHub Pages

The existing workflow at `.github/workflows/pages.yml` publishes the repository root to GitHub Pages when changes reach `main`. The existing custom domain remains `oliworx.dev`.

## AI game helper

The chat panel calls `/api/chat`. Its backend is a Cloudflare Worker using the Workers AI binding, so no model API key is placed in the browser.

To deploy or update the backend:

1. Install Node.js if needed, then open a terminal in this repository folder.
2. Run `npx wrangler login` and finish the Cloudflare sign-in.
3. Run `npx wrangler deploy`.

The `wrangler.toml` file configures the Workers AI binding, a basic per-IP rate limit, and the route `oliworx.dev/api/*`. The domain must be an active Cloudflare zone with a proxied DNS record for `oliworx.dev`. The rate limit is approximate and users sharing one public IP can share a limit. Workers AI usage is metered; check Cloudflare's current pricing and usage dashboard.

The chat UI is included in the site, but it cannot answer until this Worker is deployed. The GitHub Pages workflow only publishes the static website; it does not deploy Cloudflare Workers.

## Updating the game directory

Edit the `games` array in `index.html`. Every entry has a display name, external URL, category, icon, color, and short description. Keep links pointed at the official game website and open them in a new tab.

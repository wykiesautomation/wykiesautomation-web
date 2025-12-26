
# Wykies Automation — Public Site (Option A Skeleton)

## Deploy to GitHub Pages
1. Push this folder to a GitHub repo named `wykiesautomation.co.za` (or any repo).
2. Enable GitHub Pages (source: `main` branch, root).
3. Point Cloudflare DNS: `A`/`CNAME` for `wykiesautomation.co.za` to GitHub Pages, enable SSL Full (strict).

## Configure
- Edit `config.json` and set:
  - `appsScriptUrl`: your Google Apps Script Web App URL
  - `env`: `live` when moving out of sandbox
- Provide real PNG/WebP images under `assets/img/`.

## CMS & Contact
- `assets/js/products.json` is a fallback. Live data comes from Apps Script: `?action=products&sheetId=...`.
- Contact form posts `action=contact` to Apps Script and emails `wykiesautomation@gmail.com`.

## PayFast
- Checkout uses `window.initCheckout(sku)` which calls `POST /api/payfast/init`.
- Implement this on Cloudflare Worker to:
  - Validate SKU & price
  - Build and sign the PayFast form (do **not** expose passphrase in client)
  - Return auto-submit HTML form to redirect to PayFast.

## Security
- CSP meta is included. Serve via HTTPS with HSTS.

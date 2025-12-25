# Wykies Automation Website v4.0

Static site for GitHub Pages with Google Sheets CMS and PayFast ITN integration.

## Structure
- `index.html` — Home/catalog
- `product.html` — Per-product page (uses `?sku=WA-01`)
- `gallery.html` — Image gallery
- `admin.html` — Admin UI (wire-up to Apps Script API)
- `assets/` — Images, CSS, JS, sample data
- `payfast-itn-worker.js` — Cloudflare Worker forwarder
- `AppsScript_Code.gs` — Google Apps Script (API + ITN stub)

## Configure
1. Upload images if you replace them; current images were extracted from the spec doc.
2. Set `config.json` values. Do **not** expose secrets in client-side JS.
3. Deploy Apps Script web app and paste its URL into `config.json` or as `APPSCRIPT_URL` in Cloudflare Worker.
4. Point your domain to GitHub Pages and enable HTTPS/HSTS in Cloudflare (Full strict).

## Payments
- Use PayFast Live for production.
- Validate signature, amount and source IP. Do not fulfill if validation fails.

## License
© Wykies Automation. All rights reserved.

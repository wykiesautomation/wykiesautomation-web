
# Wykies Automation (GitHub Pages)

This repository hosts the public website for **Wykies Automation**.

## Structure
- `index.html` – Catalog of products
- `product.html` – Per-product page, open as `product.html?sku=WA-03`
- `gallery.html` – Image gallery
- `contact.html` – Contact form (Posts to Google Apps Script Web App)
- `admin.html` – Admin UI (demo only; wire to Google Sheet CMS)
- `assets/css/styles.css` – Site styles (dark theme)
- `assets/js/app.js` – Client logic, product data, PayFast stub
- `assets/img/` – Images and logo
- `CNAME` – Custom domain: wykiesautomation.co.za

## Quick start
1. Enable GitHub Pages: **Settings → Pages → Deploy from a branch**, Branch = `main` (root).
2. Commit & push all files to `main`.
3. DNS: Point `wykiesautomation.co.za` to GitHub Pages (A/AAAA for apex, CNAME for `www`).

## Configure Contact Form
Edit `assets/js/app.js` and set `CONFIG.CONTACT_ENDPOINT` to your Apps Script Web App URL.

## PayFast (Important)
Replace the Buy stub with a server-side signature flow and ITN handler. Do **not** expose your passphrase in the frontend.

## License
© 2025 Wykies Automation. All rights reserved.

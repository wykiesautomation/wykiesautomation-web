
# Wykies Automation — Public Site

Starter build aligned with Master Spec v5.

## Configure
- Edit `config.json` with your Apps Script Web App URL and Google Sheet ID.
- WhatsApp number is set to `+27716816131`.

## PayFast Checkout (Sandbox)
Client does **not** compute signatures. Use backend endpoint (`action=create_checkout`) to return `redirectUrl` to PayFast sandbox.

## Pages
- `index.html` — Home with hero, product grid, gallery preview.
- `product.html` — Product details from CMS.
- `gallery.html` — Full gallery with lightbox.
- `legal/*` — Privacy, Terms, Refunds.

## Assets
Images are placeholders. Replace with real product/gallery assets (`assets/img/products/wa-XX.png`).

## Deploy
Host on GitHub Pages. Point Cloudflare DNS and enable SSL Full/Strict.

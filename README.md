# Wykies Automation — Test Site Bundle

This ZIP contains a static prototype of the Public site and product pages per Master Spec v6.1.

## Structure
- `index.html` — brand-blue hero (no dashboard screenshot in hero).
- `site/products/index.html` — Products grid (no gallery button on grid).
- `site/products/pages/WA-xx.html` — Product details with Buy (PayFast) + WhatsApp.
- `public/assets/` — Logo and product images (WAP placeholders).
- `legal/` — Terms, Refunds, Privacy (POPIA), PAIA link placeholders.
- `docs/` — Documents index + per-product PDF placeholders.

## Images
Replace placeholders under `public/assets/product/` with your actual WAP images (e.g., `WAP-01.png`). Optional gallery images under `public/assets/gallery/` as `WAG-xx-x.png`.

## PayFast
The Buy button posts to PayFast LIVE. The signature/passphrase handling must remain **server-side** (Apps Script ITN handler). Update `notify_url` if your Web App changes.

## Deployment (GitHub Pages)
1. Copy all files to your repo root.
2. Ensure GitHub Pages is enabled for the main branch.
3. Visit `/site/products/index.html` to browse products.

## SWR Refresh
Prices on product pages auto-refresh every 60s from `/site/products/products.json`. Integrate your Apps Script API later for live CMS edits.

## Branding
Uses Inter font and #2F76FF accents. Hero is brand-blue with headline + CTAs.

--
M365 Copilot

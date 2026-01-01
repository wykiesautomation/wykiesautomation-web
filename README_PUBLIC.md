# Wykies Automation — Public Site (Dark Theme)

This package contains the public site ready for GitHub Pages. It pulls data from the Google Sheets CMS via your Apps Script Web App and supports PayFast checkout.

## Structure
```
WykiesAutomation_Public/
  index.html
  config.json
  robots.txt
  sitemap.xml
  CNAME
  assets/
    css/styles.css
    js/app.js
    gallery/wa-01.png, wa-03.png, wa-11.png (placeholders)
  docs/
    WA-01-Manual.pdf (placeholder)
    WA-03-Spec.pdf (placeholder)
    Price-List.pdf (placeholder)
```

## Configure
- Edit `config.json` if your Apps Script URL changes.
- Keep secrets (PayFast keys, passphrase) in Script Properties server-side.

## Deploy (GitHub Pages)
1. Create a repo and copy this folder contents into the repo root.
2. Add `CNAME` with `wykiesautomation.co.za` (already included) and enable Pages.
3. Point your DNS to GitHub Pages (A/AAAA/CNAME). Cloudflare SSL Full/Strict recommended.

## CMS Endpoints expected
- `GET ?action=catalog` → Products array
- `GET ?action=gallery` → Gallery array
- `GET ?action=pages` → Legal pages array
- `POST ?action=checkout` → returns `{url}` for PayFast

## Notes
- PNG-only assets per spec. Replace the gallery placeholders with your real PNGs.
- Documents section uses local `/docs/` and can be swapped to Drive links if preferred.
- Contact path dropdown opens pre-filled Email or WhatsApp.

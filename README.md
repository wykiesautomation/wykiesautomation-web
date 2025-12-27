
# Wykies Automation Website v5.2

This package is ready to publish to GitHub Pages and maps to `wykiesautomation.co.za`. The hero is brand-blue (#2F76FF), the Inter font is used site-wide, and all product images include the Wykies Automation logo watermark.

## Structure
- index.html — Home (hero + products + documents)
- products/*.html — Per-product pages (WA-01 … WA-11)
- gallery.html — Gallery preview
- admin/index.html — Admin dashboard (dark theme; includes **Resend Invoice** button)
- assets/css/styles.css — Theme styles
- assets/js/app.js — Public site scripts
- assets/js/admin.js — Admin scripts
- assets/img/*.png — Logo, product images, gallery thumbnails
- docs/*.pdf — Master Spec v5.2 and User Manual template
- config.json — Apps Script URL, Google Sheet ID, and allowlist

## Publish
1. Create a GitHub repo and commit these files to the `main` branch.
2. Enable GitHub Pages: Source = `main` → `/ (root)`.
3. Add a `CNAME` file with `wykiesautomation.co.za` if using a custom domain.
4. Point your DNS `A`/`CNAME` records to GitHub Pages and enable SSL (Cloudflare recommended).

## Notes
- Replace `appsScriptUrl` in `config.json` with your deployed Apps Script endpoint.
- Replace placeholder PDFs with final documents.
- When adding PayFast live integration, keep secrets out of client-side JS.

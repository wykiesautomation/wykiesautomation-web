
# Wykies Automation — Public Site (Full Package)

This archive contains the **entire public website** with branding, images, dark theme, and enquiry/contact integration hooks.

## Structure
- `index.html`, `gallery.html`, `products/product.html`, `legal/`, `contact.html`
- `assets/css/` — `main.css`, `branding.css`, `dark.css`
- `assets/js/` — `app.js` (site logic), `theme.js` (theme toggle)
- `assets/img/` — favicons, OG image, **logo**, product placeholders `wa-01..wa-12.png`, gallery thumbs
- `downloads/trial/` — placeholder folder for trial builds

## Configure
1. **Apps Script Web App URL**: set in two places
   - `index.html` → `window.WA_BOOT.apiBase`
   - `assets/js/app.js` → `const ENQUIRY_ENDPOINT`
2. **Sheet ID** is prefilled (`WA_BOOT.sheetId`).
3. Once your Drive sync has populated real image URLs in Sheets, the UI will use those instead of placeholders.

## Deploy to GitHub Pages
- Push this folder to your repo as the site root.
- In repo settings, enable **GitHub Pages** (Deploy from `main` / `docs` as applicable).
- Map your domain `wykiesautomation.co.za` via Cloudflare to GitHub Pages CNAME.

## Notes
- Place your real product images on Google Drive and run **Admin → Sync** to make the site read them.
- Replace legal templates in `legal/` with your final policies.

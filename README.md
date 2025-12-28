# WykiesAutomation.co.za — Clean Rebuild (Public + Admin)

This pack contains a static public site and an Admin dashboard that work with Google Sheets as a CMS and Google Apps Script for secure operations (Payments, Invoices, Gallery updates).

## Structure
```
index.html
gallery.html
products/product.html
legal/privacy.html
legal/terms.html
legal/refunds.html
assets/css/main.css
assets/js/app.js
assets/js/gallery.js
assets/js/gallery-data.json
admin/index.html
admin/app.js
apps_script/Backend.gs
```

## What’s included
- **Brand-blue hero** with headline + CTAs (Download Trial, View Docs, Contact, WhatsApp).
- **Products** grid (dynamic from Google Sheets; falls back to local).
- **Gallery** grid with lightbox (data-driven JSON).
- **Per-product page** with VAT-inclusive price + **Price Log** section.
- **PayFast** Buy button (LIVE) — secure **passphrase** handled server-side in Apps Script ITN.
- **Admin** (subdomain-ready) with Google Sign-In (allowlist), Products editor, Payments list, Gallery editor, **Resend Invoice**.
- **Apps Script backend** to verify Google ID token, read/write Sheets, stub ITN + invoice.

## Setup (once)
1. **GitHub Pages**: push this folder; set custom domain `wykiesautomation.co.za`.
2. **Assets**: place logos under `/assets/img/branding/` and product images under `/assets/img/products/` (PNG + WebP + -thumb variants).
3. **Google Sheet**: ensure sheet contains tabs: `Settings`, `Products`, `PriceLog`, `Payments`, `Gallery`.
4. **Apps Script**:
   - Create a new Apps Script project, paste `apps_script/Backend.gs`.
   - Deploy **Web App**: *Execute as Me*, access: *Anyone*. Copy deployment ID into `notify_url` in `assets/js/app.js` and `BACKEND_URL` in `admin/app.js`.
   - Add your allowlist email in `ALLOWLIST` (already set to `wykiesautomation@gmail.com`).
5. **Google OAuth**: Create a Web client in Google Cloud, set authorized JS origins to your **admin subdomain**; put client ID into `admin/index.html`.

## Daily use
- Update **Products** and **Gallery** via Admin — writes to Google Sheets, immediately reflected on the public site.
- View **Payments** and **Resend Invoice** from Admin.

## Notes
- Only **wykiesautomation@gmail.com** is allowed in Admin by default.
- The **PayFast passphrase** is **never exposed** client-side; keep it server-side for ITN validation.
- All email/WhatsApp CTAs point to your single address & number.

---
Made to run for years with minimal maintenance. Replace placeholders only when you’re ready (legal pages, Docs PDFs, Apps Script ID).

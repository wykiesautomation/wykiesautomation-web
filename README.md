
# Wykies Automation — Public & Admin Bundle (v5.1)

**Date:** 2025-12-26

This bundle contains the public website and admin dashboard, ready for GitHub Pages. It follows the PNG-only policy and uses a Google Sheets CMS + Apps Script Web App.

## Structure

```
WykiesAutomation_Bundle_v5_1/
├─ index.html
├─ product.html
├─ gallery.html
├─ return.html
├─ cancel.html
└─ assets/
   ├─ css/styles.css
   ├─ js/app.js
   └─ img/
      ├─ logo-blue.png
      ├─ wa-01.png
      ├─ gallery-01.png
      ├─ gallery-02.png
      └─ gallery-03.png
/admin/
├─ index.html
└─ assets/
   ├─ css/admin.css
   └─ js/admin.js
```

## Configure

1. **Apps Script Web App URL**: set `API_BASE` in `assets/js/app.js` and `admin/assets/js/admin.js`.
2. **PayFast return/cancel**: server-side `createPayment` must set `return_url` → `https://<domain>/return.html`, `cancel_url` → `https://<domain>/cancel.html`, and `notify_url` → ITN handler.
3. **Admin allowlist**: keep `wykiesautomation@gmail.com` only.
4. **Images**: replace placeholder PNGs. Use Google Drive direct links in the Sheet; local PNGs act as fallback.
5. **Cloudflare**: set SSL Full/Strict, HSTS, and CSP headers.

## Notes
- No secrets in client. Store PayFast passphrase/keys in Apps Script Script Properties.
- Admin endpoints must validate JWT and log actions to the `Logs` tab.

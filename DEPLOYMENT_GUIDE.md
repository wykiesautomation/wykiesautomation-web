
# Wykies Automation — Public Site Deployment Guide

**Last updated:** 2025-12-26 10:02

This guide walks you through deploying the public catalog to **GitHub Pages**, wiring the **custom domain** `wykiesautomation.co.za`, and configuring **Cloudflare** and **Google Apps Script**.

## 1) Repository & Pages
1. Create a GitHub repo, e.g. `wykiesautomation-public`.
2. Commit the contents of the `public/` folder to the repo root.
3. Enable **Settings → Pages → Deploy from a branch** (branch: `main`, folder: `/`).
4. Wait for Pages to publish (the site will be available at `https://<username>.github.io/wykiesautomation-public/`).

## 2) Custom Domain
1. In **Settings → Pages → Custom domain**, enter `wykiesautomation.co.za`.
2. In your DNS provider (Cloudflare), point the apex domain to GitHub Pages (use a CNAME-like setup if supported or the provider’s recommended approach for apex → Pages). Proxy via Cloudflare (orange cloud) in production.
3. Add `www` as a CNAME to `<username>.github.io` (optional).

> Keep HTTPS enforced. After verifying, enable HSTS with `includeSubDomains; preload`.

## 3) Cloudflare Security & Performance
- Turn on SSL/TLS = **Full (strict)**, **Always Use HTTPS**.
- Add WAF managed rules and rate limiting on `/admin` and `/api`.
- Cache `/assets/*` with a long TTL; bypass `/api/*`.
- Implement PayFast IP validation at the **edge** (Cloudflare Worker) if you front the ITN handler.

## 4) Configure Google Apps Script
Edit `config.json` and ensure:
```json
{
  "appsScriptDeploymentId": "AKfycbYQad-4V64QsRkFpPqoDWE8h-w4AzIQa2GKiITVoiqnYnCa6Xxv0hdqjkE4pTnoHj2Nw",
  "appsScriptWebAppUrl": "https://script.google.com/macros/s/AKfycbYQad-4V64QsRkFpPqoDWE8h-w4AzIQa2GKiITVoiqnYnCa6Xxv0hdqjkE4pTnoHj2Nw/exec"
}
```
Deploy your Apps Script as a web app with **Anyone** access and point form submissions there.

## 5) Contact & WhatsApp
- Email is sent to **wykiesautomation@gmail.com** via Apps Script.
- WhatsApp opens to **+27 71 681 6131** with a prefilled message.

## 6) PayFast (Checkout & ITN)
- Do **not** expose the passphrase in client JS. Validate signature, source IP, and amount server-side.
- On verified payment, generate a **SARS-compliant PDF invoice**, email to customer and admin, and log to Google Sheets.

## 7) SEO & Accessibility
- Titles ≤ 60 chars; meta descriptions ~155 chars.
- Provide ALT text for images; maintain contrast ≥ 4.5:1.

## 8) Updating Products
- Either edit `assets/data/products.json` manually or use the **Admin** panel (recommended) wired to Google Sheets.


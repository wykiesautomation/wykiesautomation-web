# Wykies Automation — v5.2 Two-Page Site

This package contains **two webpages** ready for GitHub Pages hosting:

- `index.html` — Public Home with brand-blue hero (no dashboard screenshots) and CTAs (Download Trial, View Docs, WhatsApp).
- `admin/index.html` — Dark Admin with tabs (Products, Gallery, Payments with **Resend Invoice**, Logs).

## Quick Start (GitHub Pages)
1. Create a new GitHub repository (public).
2. Upload the contents of this folder to the repo root.
3. In **Settings → Pages**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
4. Your site will be available at `https://<username>.github.io/<repo>/`. Configure your custom domain in **Pages → Custom domain** (e.g., `wykiesautomation.co.za`).

## Cloudflare DNS & SSL
- Add an **A** or **CNAME** for `@` and `www` to GitHub Pages per Cloudflare docs.
- Add `admin` subdomain CNAME to the same Pages host for the Admin.
- Enable SSL/TLS **Full (strict)** and add a WAF rate-limit rule on `/admin` and `/apps_script`.

## Configure the CMS
- Open `config.json` and set `env` to `prod` once your Apps Script is live.
- Deploy the provided Apps Script (`apps_script/Code.gs`) as a Web App and paste its URL into `apps_script_url`.
- Ensure your Google Sheet matches the column names in the spec.

## PNG-Only Policy
All images here are **PNG** placeholders. Replace them with your real PNGs (keep filenames).

## PayFast
The client calls `createCheckout` on Apps Script to receive a **server-signed** form. Store your Merchant ID/Key/Passphrase in **Script Properties**.

## Accessibility & Performance
- ALT text added; images below the fold are `loading="lazy"`.
- CSP meta tags added; for strict headers, set them in Cloudflare.


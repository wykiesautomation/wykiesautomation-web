# Wykies Automation — Live Products & Admin (Starter Build)

This repository is a **GitHub Pages** static site that connects to a **Google Sheets + Apps Script** backend for:

- Product catalog (per-product pages)  
- Admin edits (name, price, image, trial URL, enabled)  
- Gallery management  
- Contact form (email + Google Sheet log)  
- PayFast checkout (server-side signature via Apps Script) and **ITN** handler that emails a **PDF invoice** on verified payments

> **Deployment target:** GitHub Pages (no Netlify).  
> **Payments:** PayFast **LIVE** only (you can switch to Sandbox in Script Properties when testing).

---

## 1) Google Sheet (CMS)
Create a Google Sheet with three tabs: **Products**, **Gallery**, **Orders**. Use these headers:

### Products
`sku, name, price, image, trial, description, enabled`

### Gallery
`url, title, sku`

### Orders
`timestamp, payfast_payment_id, sku, buyer_email, amount, status, raw`

Populate **Products** with your SKUs and prices (VAT-incl):

- WA-01: 3D Printer Control V1 — R1,499  
- WA-02: Plasma Cutter Control V1 — R2,499  
- WA-03: ECU/TCU Control System V1 — R6,499  
- WA-04: Fridge/Freezer Control V1 — R899  
- WA-05: Nano GSM Gate Controller V1 — R800  
- WA-06: Solar Energy Management System V1 — R3,999  
- WA-07: Hybrid Gate Controller V1 — R1,800  
- WA-08: Smart Battery Charger V1 — R999  
- WA-09: Gate/Garage Controller V1 — R1,009  
- WA-10: 12CH Hybrid Alarm V1 — R1,299  
- WA-11: 16CH Hybrid Alarm V1 — R5,499  
- WA-12: TCU Gearbox Controller V1 — R4,500  

(You can update pricing any time in the Admin panel.)

## 2) Apps Script Web App
- Open **Extensions → Apps Script** on the Sheet.
- Create files `WykiesAutomation.gs` and `invoice_template.html` using the contents in `scripts/apps_script/`.
- Deploy: **Deploy → New deployment → Web app** → Execute as **Me**, who has access: **Anyone**.
- Copy the `/exec` URL.
- Set **Script properties** (Project Settings → Script properties):
  - `SHEET_ID` = your Sheet ID
  - `ADMIN_PASSPHRASE` = your admin passphrase (e.g., Ford@20132016)
  - `ADMIN_TOKEN_SECRET` = a random long string used to mint JWT-like tokens
  - `PAYFAST_PASSPHRASE`, `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`
  - `PAYFAST_SANDBOX` = `false` (for live)
  - `ADMIN_EMAIL` = `wykiesautomation@gmail.com`

## 3) Link the site to the web app
- Edit `/config.json` and paste your Apps Script **/exec** URL.

## 4) Publish to GitHub Pages
- Push this folder to a repo named `wykiesautomation.github.io` **or** use the repo Settings → Pages → Deploy from branch (root).
- (Optional) Add a `CNAME` file with `wykiesautomation.co.za` and point your DNS `A`/`ALIAS` to GitHub Pages.

## 5) PayFast ITN
- In PayFast dashboard, set **ITN URL** to your Apps Script web app URL with `?route=payfast/itn`.
- The script validates the signature, looks up the SKU and price from the Sheet, and when valid it:
  - logs to **Orders**
  - generates a PDF invoice
  - emails the customer and `wykiesautomation@gmail.com`

## Test checklist
- Products load on the home page
- Admin login works and edits persist
- Contact form emails and logs
- Payment redirection works and ITN flips orders to *COMPLETE* and emails invoice

---

**Branding**: Uses the original blue logo by default. Replace `/assets/img/logo.svg` if you have a final SVG.

**Security**: No secrets are stored in the site. All sensitive operations are performed in Apps Script with validation and a short-lived admin token.


# Wykies Automation — LIVE Products & Admin System

This repository contains:
- Public site (index, product, gallery) — GitHub Pages-ready.
- Admin panel (passphrase protected) with Google Sheets CMS.
- Apps Script server (JSON API, PayFast payment creation, ITN handler, invoice PDF generation).

## 1) Google Sheet CMS
Create a Google Sheet with tabs:
- **Products**: sku, name, price, summary, description, imageUrl, trialUrl, docUrl, active
- **Gallery**: url, caption, addedAt
- **Payments**: Timestamp, InvoiceNo, OrderID, pf_payment_id, Email, SKU, TotalInclVAT, ReleasedAt

Open Apps Script from the Sheet and copy files from `server/*.gs` into the project.

### Script Properties (File > Project properties > Script properties)
Set:
- `ADMIN_EMAIL` = wykiesautomation@gmail.com
- `ADMIN_PASSPHRASE` = Ford@20132016
- `PF_MERCHANT_ID` = 32913011
- `PF_MERCHANT_KEY` = 8wd7iwcgippud
- `PF_PASSPHRASE` = Ford@20132016
- `INVOICE_PREFIX` = INV-

Deploy **Web App** (Execute as: Me, Who has access: Anyone). Copy the Web App URL into `config.json` as `appsScriptUrl`.

## 2) GitHub Pages
- Push this folder to a repo named `wykiesautomation.github.io` or any repo and enable Pages.
- Ensure `config.json` points to the Apps Script Web App URL.
- Place real images under `assets/img/` or set `imageUrl` in the Products sheet to Drive/Cloud-hosted URLs.

## 3) PayFast
- Payment creation uses Apps Script to compute the signature server-side. The client never sees the passphrase.
- ITN handler endpoint: the same Web App with `endpoint=payfastITN`. Set this URL as **Notify URL** in PayFast.
- Return URL: `https://wykiesautomation.co.za/thanks.html` (create simple pages if desired).

## 4) Invoices
- PDFs are stored in Drive under `Invoices/<YEAR>/INV-xxxxx.pdf`.
- Email with invoice is sent to the customer and CC to `ADMIN_EMAIL`.

## 5) Admin
- Passphrase login.
- Edit product fields and add gallery images.
- Resend invoice for successful payments.

## 6) Security Notes
- Keep the passphrase in Script Properties only (server-side).
- Do not expose credentials in `config.json`.
- Consider restricting Apps Script Web App to **Anyone with Google Account** and implementing a token check.

## 7) FAQ
- If products don’t load, check `config.json` and Web App deployment.
- If checkout fails, ensure Script Properties have PayFast credentials and the Notify URL is reachable.
- Adjust `validPayFastIP()` with latest PayFast IP ranges.

# Wykies Automation — Static Site + Admin (Serverless)

This package contains a static catalog site (`index.html`, `product.html`, `gallery.html`) and a lightweight Admin panel (`admin.html`) that integrates with a Google Apps Script Web App acting as a JSON API. Images are extracted from your uploaded spec where available, and you can upload new product images via Admin.

## Structure
- `index.html` — Home + product grid + contact form
- `product.html` — Per-product detail + PayFast checkout button
- `gallery.html` — Simple gallery from `/assets/img` images
- `admin.html` — Passphrase login, product editor, image upload, payments view
- `assets/css/styles.css` — Dark theme styling
- `assets/js/app.js` — Data loading, rendering, contact, PayFast submit
- `assets/js/admin.js` — Admin login, product CRUD, image upload (to Apps Script)
- `data/products.json` — Seed product data
- `config.sample.json` — Fill your Apps Script URL and PayFast settings
- `scripts/apps_script_webapp.gs` — Google Apps Script backend (deploy as Web App)
- `server/payfast_notify.gs` — Apps Script endpoint for PayFast ITN (notify_url)
- `assets/img/*` — Extracted images from DOCX

## Deploy (GitHub Pages)
1. Create a new public repo and add all files.
2. Commit `config.json` (copy `config.sample.json` and set real values).
3. Enable GitHub Pages from `main` branch `/` root.
4. Point your `wykiesautomation.co.za` DNS (A/AAAA or CNAME) to GitHub Pages.

## Google Apps Script
- Open `scripts/apps_script_webapp.gs` in Apps Script editor.
- Deploy as *Web App* and set *Anyone with the link* can access.
- Put the deployed URL into `config.json` as `appsScriptApiUrl`.

## PayFast
- Set `merchant_id`, `merchant_key`, `return_url`, `cancel_url`, `notify_url` in `config.json`.
- Publish `server/payfast_notify.gs` as a Web App and use its URL for `notify_url`.
- Ensure ITN security: signature verification, source IP check, and amount vs SKU.

## Admin Passphrase
Per spec, the Admin passphrase defaults to `Ford@20132016`. Change in `admin.js` and Apps Script to secure.  

## Notes
- Images extracted from the provided DOCX are saved as `assets/img/image_#.png`. You can upload product-specific images in Admin; they will be stored in Google Drive and the Product record updated.
- Trial and documentation download links can be set per product in Admin (e.g., Google Drive links).


## Configure Script Properties (Apps Script)
Set the PayFast passphrase and optional IP overrides under *Project Settings → Script Properties*:
```
PAYFAST_PASSPHRASE=Ford@20132016
PAYFAST_IPS=34.107.176.71,34.120.184.229,197.97.145.144,197.97.145.159,41.74.179.192,41.74.179.223,102.216.36.0,102.216.36.15,102.216.36.128,102.216.36.143,144.126.193.139
```
Update the `config.json` `appsScriptApiUrl` and `notify_url` after you deploy the Web App.

## ITN Security Checks Implemented
- Signature verification (alphabetised keys + MD5 + passphrase).
- Source IP validation (ranges provided; override supported).
- Amount vs SKU price check.
- Valid data security check with server-to-server validation.

## Invoices
- SARS-style tax invoice PDF generated and stored under `Invoices/YYYY/INV-xxxxx.pdf`.
- Email sent to customer and `wykiesautomation@gmail.com`.


## Import from XLSX (Admin)
1. Upload your `WykiesAutomation_CMS_Final_v3_6.xlsx` to Google Drive.
2. In Apps Script, enable **Advanced Google services → Drive API v2** and in **Google Cloud Console** enable Drive API for the script project.
3. Open `admin.html` → **Import from XLSX**, paste the Drive **file ID**, and click **Import**.
4. The script converts XLSX → Google Sheet, reads the **Products** and **Gallery** tabs, and repopulates the CMS Sheets.

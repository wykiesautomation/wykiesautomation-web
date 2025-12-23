
# Wykies Automation — v3.1 Starter

This package includes the public site, admin panel, and Google Apps Script backend scaffolding required to run the LIVE system as per the specification.

## Structure
```
/ (GitHub Pages root)
  index.html, product.html, gallery.html, success.html, cancel.html, admin.html
  /assets/css/styles.css
  /assets/js/api.js, main.js, product.js, payfast.js, admin.js
  /assets/img/logo_blue.png (placeholder), placeholder-product.jpg
  /config/config.json (create from config.sample.json)
/backend/apps_script/Code.gs (deploy as Web App)
/backend/optional_worker/payfast-notify.js (optional)
```

## Step 1 — Create the Google Sheet (CMS)
Create a sheet with 3 tabs and exact headers in row 1:
- **Products**: `sku, name, price, summary, description, imageUrl, trialUrl, docUrl, active`
- **Gallery**: `url, caption, active`
- **Payments**: `Timestamp, InvoiceNo, OrderID, pf_payment_id, Email, SKU, TotalInclVAT, ReleasedAt`

Populate Products with your WA-01 … WA-12 items and VAT-inclusive prices.

## Step 2 — Apps Script Backend
1. In Google Drive, **New → Apps Script**. Create a script and paste `backend/apps_script/Code.gs` replacing the default.
2. Set **Project Settings → Script properties**:
   - `SPREADSHEET_ID` = The CMS sheet ID
   - `ADMIN_EMAIL` = `wykiesautomation@gmail.com`
   - `MERCHANT_ID` = your PayFast merchant_id
   - `MERCHANT_KEY` = your PayFast merchant_key
   - `PAYFAST_PASSPHRASE` = your PayFast passphrase (used for signature verification)
   - `ENV` = `live` or `sandbox`
   - `INVOICE_TEMPLATE_ID` = the Google Doc template file ID with placeholders
   - `INVOICE_FOLDER_ID` = the folder ID for saving invoices (root if blank)
   - `ADMIN_PASSPHRASE_SHA256` = SHA-256 of your admin passphrase (see below)
3. **Admin passphrase hash**: In the Apps Script console, run:
```js
function setAdminPass(){
  const pass = 'Ford@20132016'; // or use another secret
  const h = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pass).map(b=>('0'+(b&0xff).toString(16)).slice(-2)).join('');
  PropertiesService.getScriptProperties().setProperty('ADMIN_PASSPHRASE_SHA256', h);
}
```
4. **Deploy**: `Deploy → New deployment → Web app`.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Copy the Web App URL (ends with `/exec`).

## Step 3 — Config (Frontend)
1. Copy `config/config.sample.json` to `config/config.json`.
2. Set fields:
```json
{
  "appsScriptUrl": "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
  "contact": {"whatsapp_number": "27716816131"},
  "payfast": {
    "env": "live",
    "merchant_id": "YOUR_MERCHANT_ID",
    "merchant_key": "YOUR_MERCHANT_KEY",
    "return_url": "https://wykiesautomation.co.za/success.html",
    "cancel_url": "https://wykiesautomation.co.za/cancel.html",
    "notify_url": "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=itn"
  }
}
```
**Do not** put the PayFast *passphrase* in the frontend; it is used only on the server.

## Step 4 — PayFast Dashboard
- Ensure your account uses the same **merchant_id** and **merchant_key** you configured.
- Add the **Notify URL** above (Apps Script Web App with `?action=itn`).
- For sandbox testing, switch `env` to `sandbox` in `config.json`.

## Step 5 — Google Docs Invoice Template
Create a Google Doc with placeholders used by the backend:
```
{{INVOICE_NO}}
{{DATE}}
{{BILL_TO_NAME}}
{{BILL_TO_EMAIL}}
{{ORDER_ID}}
{{SKU}}
{{ITEM_DESC}}
{{QTY}}
{{NET}}
{{VAT}}
{{TOTAL}}
```
Put your company details, VAT number, logo (blue only), and bank details in the header/footer.

## Step 6 — GitHub Pages Deployment
- Push the web root to your GitHub repo (e.g., `wykiesautomation.github.io` or a repo with Pages enabled for `/` root).
- Ensure `config/config.json` is committed with the public values and correct URLs.
- Point your domain DNS (A/AAAA/CNAME) to GitHub Pages and set the custom domain in the repo settings.

## QA Checklist
- [ ] Products load from Google Sheet
- [ ] PayFast sandbox payment completes; return/cancel pages work
- [ ] ITN signature validates; `Payments` sheet logs row; invoice emailed to customer & admin
- [ ] Admin login works; product edits reflect on site
- [ ] Resend invoice works and includes Order ID and SKU
- [ ] Gallery lazy-loads and shows only `active=true`

## Notes
- All prices are VAT inclusive; invoice shows NET + VAT (15%) split.
- The backend validates: merchant, signature (SHA-512), server `validate` call, and price match to SKU before fulfilling.
- Consider restricting Apps Script by checking the source IP if needed; the `validate` call already confirms origin.

---
© 2025 Wykies Automation. Use original blue logo only; avoid metallic silver variants.

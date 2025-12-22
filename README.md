# Wykies Automation — GitHub Pages Bundle (PayFast LIVE + ITN security + PDF invoices)

## Deploy steps
1. **Copy contents** of this bundle to your GitHub repo root (main branch).
2. Place images:
   - Logo: `assets/img/logo.png`
   - Gallery: `assets/img/gallery/workshop.jpg`, `assets/img/gallery/control-panel.jpg`
   - Product images: `assets/img/products/WA-01.png`, `WA-02.png`, ... (match `products.json`)
3. Repo → **Settings → Pages** → Source = `main`, **root**.
4. **Apps Script Web App**:
   - Open `apps_script/Code.gs`, copy into Google Apps Script project.
   - Set `SHEET_ID`, `TEMPLATE_DOC_ID`, `INVOICE_FOLDER_ID`, and optionally `SECURITY_PASSPHRASE`.
   - Deploy as **Web App** (Execute as Me, access: Anyone/Anyone with link).
   - Keep the `/exec` URL as your `notify_url` (already embedded in forms).
5. **PayFast LIVE** is already set in forms. For Sandbox tests, change form `action` to `https://sandbox.payfast.co.za/eng/process` and switch back to Live after testing.

## Notes
- ITN (server-to-server) posts to your `notify_url`; users are not redirected there.
- Signature validation requires correct field order and URL encoding (spaces '+', percent-encodings uppercase). If you set a passphrase in PayFast, use the same in Apps Script.
- The Apps Script generates a PDF invoice from your Google Docs template, stores it in your Drive folder, and emails it to the customer and admin.

## Placeholders to add in your Google Doc template
```
{COMPANY}
{VAT}
{DATE}
{ITEM}
{AMOUNT}
{FIRST}
{LAST}
{EMAIL}
{PF_REF}
{OUR_REF}
{STATUS}
```

## Contact
Admin email: wykiesautomation@gmail.com
Domain: https://wykiesautomation.co.za
PayFast Merchant: ID 32913011, Key 8wd7iwcgippud
Notify URL: https://script.google.com/macros/s/AKfycbxRxrjMnoQlPI3nFZFeRS4yoUExGw1_cxWZIfQAoS8HJf3QCTH9Hk6FdqqNkETpWXPa0g/exec

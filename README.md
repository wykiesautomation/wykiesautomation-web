
# Wykies Automation — Public Web

Static site for products, contact, pre‑order, and PayFast checkout.

## Configure
1. Edit `config.json` and set `cms.appsScriptBase` to your deployed Google Apps Script Web App URL (e.g., `https://script.google.com/macros/s/XXXX/exec`).
2. Confirm contact email `wykiesautomation@gmail.com` and WhatsApp `+27716816131`.
3. Publish via GitHub Pages.

## Pages
- `/index.html` — Home with featured products
- `/products.html` — Product list (from Google Sheets via Apps Script; falls back to hardcoded prices)
- `/product.html?sku=WA-01` — Product details + PayFast button
- `/contact.html` — logs to Google Sheet and emails notifications
- `/pre-order.html` — logs to Google Sheet and emails notifications

## PayFast
The checkout form posts to PayFast with `merchant_id`, `merchant_key`, `amount`, and `item_name`. The `signature` MUST be added server‑side. This project uses a Cloudflare Worker at `https://wykiesautomation.co.za/api/payfast-itn` for ITN notifications.

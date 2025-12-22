
# Wykies Automation — Web Package (Platform-neutral)

This repository contains the public site, admin panel, Apps Script CMS, and a generic Node.js PayFast ITN webhook handler. No Netlify-specific files.

## Contents
- Public: `index.html`, `product.html`, `gallery.html`, `admin.html`, `assets/`
- CMS: `cms/AppsScript_Code.gs` (publish as a Google Apps Script Web App)
- Backend (optional): `server/` (Express server) + `package.json`
- Docs: `Wykies_Admin_Quick_Guide_Final.pdf`

## Hosting
You can host the static site on GitHub Pages, any static host, or your own server.

## PayFast ITN (Webhook)
Run the backend on any Node.js host:
```bash
npm install
PAYFAST_PASSPHRASE=yourPass SHEET_API_URL=https://<apps-script>/exec npm start
```
Configure PayFast `notify_url` to `https://your-domain/payfast/itn`.

## Apps Script Web App
Deploy the script as a Web App (execute as you, accessible to anyone). Endpoints used by the site and backend:
- `GET /products`, `GET /gallery`
- `POST /products/update`, `POST /gallery/add`, `POST /contact`
- `POST /itn` (email confirmations + PDF invoice)

## Admin Passphrase
Set the front-end env in `assets/js/env.js`:
```js
window.__env = {
  SHEET_API_URL: 'https://<apps-script>/exec',
  ADMIN_PASSPHRASE: 'Ford@20132016',
  WHATSAPP_NUMBER_INTL: '27716816131'
};
```

## WhatsApp
Use `wa.me` links with your number in international format (digits only). Example:
`https://wa.me/27716816131?text=Hi%20Wykies%20Automation...`

## Notes
- Keep prices in CMS aligned with PayFast amounts to avoid ITN failures.
- Add source IP checks and amount verification in `server/payfast-itn.js` before production.

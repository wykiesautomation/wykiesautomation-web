# Wykies Automation — LIVE Build (PayFast + WhatsApp + Drive Downloads)

## How to deploy
1. Upload this folder to GitHub and connect to Netlify.
2. Netlify → Site settings → Environment:
   - `IS_SANDBOX = false`
   - `PF_PASSPHRASE = <your PayFast passphrase>`
3. Test a live payment; check Functions logs.

## Files
- index.html, css/styles.css
- assets/js/script.js, assets/js/payfast.js (LIVE merchant creds)
- netlify/functions/payfast-notify.js
- success.html, cancel.html
- netlify.toml

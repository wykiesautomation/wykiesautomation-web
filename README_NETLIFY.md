
# Wykies Automation — Netlify Function (PayFast ITN)

This function handles PayFast Instant Transaction Notifications (ITN) at:

```
/.netlify/functions/payfast-notify
```

## Environment variables (Netlify UI → Site configuration → Environment variables)

- `PF_PASSPHRASE` — Your PayFast passphrase (Settings → Developer settings)
- `PF_MERCHANT_ID` — Your PayFast Merchant ID (optional; for logging)
- `IS_SANDBOX` — `true` to test with sandbox, `false` for production (default: `true`)
- `GAS_WEBHOOK_URL` — (Optional) Google Apps Script Web App URL to log orders & send emails
- `SENDGRID_API_KEY` — (Optional) SendGrid key if you want the function to email admin
- `ADMIN_EMAIL` — (Optional) Defaults to `wykiesautomation@gmail.com`

## Notes
- The homepage `notify_url` points to `https://wykiesautomation.co.za/.netlify/functions/payfast-notify`.
- For testing, append `?sandbox=1` to the homepage URL to post to PayFast Sandbox.
- This function verifies the ITN signature, confirms with PayFast via `eng/query/validate`, and compares the amount with the expected price for `m_payment_id`.

## Google Apps Script (optional)
Deploy a Web App that accepts JSON POST and writes to a Sheet & sends email. Set its URL in `GAS_WEBHOOK_URL`.

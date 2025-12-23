
# GO-LIVE — Wykies Automation v3.1

## Only two steps remaining
1) Deploy **Apps Script** as Web App and copy the `/exec` URL.
2) Paste the URL into `config/config.json` for both `appsScriptUrl` and `notify_url`.

Example:
```
"appsScriptUrl": "https://script.google.com/macros/s/AKfycbYQ12345/exec",
"payfast": {
  ...
  "notify_url": "https://script.google.com/macros/s/AKfycbYQ12345/exec?action=itn"
}
```

Push to GitHub Pages and you are LIVE.

## Notes
- Live PayFast endpoint: https://www.payfast.co.za/eng/process
- ITN security: signature (SHA-512 + passphrase), server validate call, amount vs SKU.
- Invoices: GENERATED on `payment_status=Complete`, emailed to customer + admin.


# Wykies Automation — Live Products Site

This bundle contains a ready-to-deploy site for Netlify with:
- Product catalog (with thumbnails)
- PayFast LIVE checkout
- Google Drive "Download Free Trial (.exe)" links
- Gallery section
- Contact form with Google Apps Script email + Google Sheet logging + auto-reply (and Netlify Forms fallback)
- Netlify functions for PayFast ITN and optional server-side signing

## Configuration
- Set Netlify environment variables:
  - `IS_SANDBOX=false` (use `true` for testing)
  - `PF_PASSPHRASE=<your passphrase>` (if enabled)
  - Optional: `PF_CHECK_SOURCE_IP=true`, `PF_ALLOWED_IPS=<comma-separated IPs>`
- Deploy a Google Apps Script Web App and paste its URL into `assets/js/contact.js` (`APPS_SCRIPT_URL`).
- Create a Google Sheet and set its ID inside your Apps Script `Code.gs`.

## Testing
- Use `?sandbox=1` on the page URL to post to PayFast Sandbox.
- Confirm success/cancel pages, ITN logs, contact emails, and sheet rows.

## Branding
- Uses the ORIGINAL blue Wykies Automation logo (`assets/img/wykies-logo-blue.png`).


# Wykies Automation — Public + Admin + Backend

## Deploy overview
1. **Apps Script backend (ITN + Admin API):** Create a new Apps Script project, paste `Code.gs` (provided separately) and `backend/appsscript.json` manifest, set Script Properties (PF_MERCHANT_ID, PF_MERCHANT_KEY, PF_PASSPHRASE, SHEET_ID, SUPPORT_EMAIL, ADMIN_ALLOWLIST, GOOGLE_WEB_CLIENT_ID). Deploy as **Web App** (Anyone). Set `NOTIFY_URL` in `main.js`.
2. **Public site (GitHub Pages):** Push `/wykies-site` contents to your repo root. Enable Pages. Point domain.
3. **Admin:** Publish `/wykies-site/admin` as part of same repo or separate repo; set subdomain `admin.wykiesautomation.co.za`.
4. **Payments:** Verify PayFast LIVE form posts work and ITN handler writes logs + emails invoices.

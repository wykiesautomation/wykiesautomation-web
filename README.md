
# WykiesAutomation.co.za — Website + Admin (v1)

**What's inside**
- Public site: `index.html`, `product.html`, `gallery.html`
- Admin site: `admin/` with Products, Gallery, Payments, Logs and "Resend Invoice"
- Google Sheets CMS + Apps Script web app (`apps_script/Code.gs`)
- Cloudflare Worker (`cloudflare/worker.js`) to front ITN if desired
- Legal pages: Privacy, Terms, Refund

## Setup
1. **Google Sheets**: Use your sheet (ID already in `config.json`). Ensure tabs: `Products`, `Gallery`, `Payments`, `PriceChanges` exist with headers.
2. **Apps Script Web App**:
   - Create Apps Script; paste `apps_script/Code.gs` and `invoice_template.html`.
   - Set Script Properties: `SHEET_ID`, `ADMIN_PASSPHRASE`, `PF_MERCHANT_ID`, `PF_MERCHANT_KEY`, `PF_PASSPHRASE`, `RETURN_URL`, `CANCEL_URL`, `NOTIFY_URL`.
   - Deploy → **Web app** (execute as you; accessible to anyone).
   - Put the deployment URL into `/config.json` → `appScriptUrl`.
3. **GitHub Pages**:
   - Push the `WykiesAutomation_Web_v1` folder to a `wykiesautomation.github.io` repo or your site repo.
   - Enable Pages for the `main` branch root.
4. **Custom Domains (Cloudflare)**:
   - Point `wykiesautomation.co.za` (apex) and `www` to GitHub Pages per docs.
   - Create `admin.wykiesautomation.co.za` CNAME → `username.github.io`.
   - Enable SSL Full (strict) and HSTS.
5. **PayFast**:
   - In PayFast Dashboard, set your Notify URL to the Apps Script web app ITN endpoint (e.g., `.../exec?action=itn`).
   - Use **sandbox** for testing first.

## Notes
- Do **not** expose your PayFast passphrase in client JS; only store in Script Properties.
- Product images: place optimized PNG/WebP under `/assets/images/wa-XX.png` (≤200KB).
- The admin app writes all product edits and can be extended to append to `PriceChanges` for audit.

## Roadmap
- JWT users & roles, file upload to Drive with public links, PDF invoice generation & email via GmailApp.
- Cloudflare Worker to validate ITN source IPs and proxy to Apps Script if needed.

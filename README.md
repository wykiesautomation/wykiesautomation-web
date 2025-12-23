# Wykies Automation — Static Frontend + Google Apps Script Backend

## Deploy (Drag–Drop to GitHub Pages)
1. Go to **GitHub → New repository** (e.g., `wykiesautomation-site`).
2. **Upload all files** from this folder (or drag the ZIP contents).
3. In **Settings → Pages**, choose `main` branch `/root`.
4. (Optional) In **Settings → Pages → Custom domain**, enter `wykiesautomation.co.za`. A `CNAME` file is already included.

## Backend
- Open Google Sheet `WykiesAutomationCMS` → Apps Script. Paste the code from `server/apps_script_webapp.gs` and `server/invoice_template.html`. Deploy as **Web app** and copy the URL.
- Edit `config.json` in the repo to set `webAppUrl` and `payfast.notify_url` accordingly.

## Admin
- Go to `/admin.html`, enter passphrase (in Script Properties). Manage **Products**, **Gallery**, and **Payments**.

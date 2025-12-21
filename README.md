# Wykies Automation — Patched Site

This bundle includes the patched `index.html` referencing your real `.PNG` screenshots.

## Deploy (CLI)
1. `npm i -g netlify-cli && netlify login`
2. `netlify deploy --create-site --prod --dir=. --functions=netlify/functions`
3. Set environment variables in Netlify UI or CLI.

## Contact auto-reply
- Paste your Google Apps Script Web App URL in `assets/js/contact.js` (APPS_SCRIPT_URL).
- Redeploy.

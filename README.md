
# Wykies Automation — Public Site

This repository contains the public-facing website powered by a Google Sheet CMS and PayFast ITN handling via Cloudflare Worker.

## Configure
1. Deploy the Apps Script in `/appsscript` and set the script property `SHEET_ID` to your Google Sheet ID.
2. Update `config.json` with `apiBase` pointing to the deployed Apps Script Web App URL.
3. Deploy the Cloudflare Worker from `/cloudflare/payfast-itn-worker.js` and add secrets:
   - `APPSCRIPT_URL` — Apps Script ITN endpoint
   - `PAYFAST_IPS` — comma-separated official PayFast IP list

## Build
No build required; static assets served by GitHub Pages.


# Google Apps Script Web App — Order Logging

This Web App receives JSON from the Netlify function and appends rows to your **Google Sheet**.

## 1) Create the Sheet
- Create a Google Sheet (e.g. `Wykies Orders`) and copy its **Sheet ID** (the long ID in the URL).
- Optional: Create a tab named `Orders`.

## 2) Create the Apps Script project
- Go to https://script.google.com/ and create a **New project**.
- Create two files:
  - `webapp.gs` — paste the code from `apps-script/webapp.gs`
  - `appsscript.json` — paste the manifest from `apps-script/appsscript.json`

## 3) Configure
Edit the config at the top of `webapp.gs`:
```js
const SPREADSHEET_ID = 'PUT_YOUR_SHEET_ID_HERE';
const WEBHOOK_TOKEN  = 'CHANGE_ME_SECURE_TOKEN';
const ADMIN_EMAIL    = 'wykiesautomation@gmail.com';
```

## 4) Deploy as a **Web app**
- **Deploy → Manage deployments → New deployment**
- Type: **Web app**
- Execute as: **Me**
- Who has access: **Anyone**
- Copy the **web app URL** ending with `/exec`.

## 5) Set the URL in Netlify environment
In Netlify **Environment variables** add:
```
GAS_WEBHOOK_URL = <your_web_app_url>/exec?token=CHANGE_ME_SECURE_TOKEN
```
*(Token must match `WEBHOOK_TOKEN` in `webapp.gs`.)*

## 6) Test the flow
- Deploy site (Netlify).
- Use the PayFast **Sandbox** (`?sandbox=1` on your homepage) and complete a test payment.
- After PayFast posts the ITN to your function, the function forwards a JSON summary to Google Apps Script. Check your Sheet for a new row.

## Notes
- The web app reads JSON from `e.postData.contents` and returns a JSON response using **ContentService**. See Google docs for ContentService and web apps. 
- Data is written via **SpreadsheetApp** using `appendRow()`.
- Admin notification sent via **MailApp**.

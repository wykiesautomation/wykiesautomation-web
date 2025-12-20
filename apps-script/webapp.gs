
/**
 * Google Apps Script Web App to log PayFast ITN summaries to Google Sheets
 * Deployment: Deploy > Manage deployments > Web app > Execute as: Me, Who has access: Anyone
 * Docs: ContentService (doPost + JSON) and SpreadsheetApp append values.
 *
 * Sheet columns: timestamp, sandbox, ok, signatureValid, amountValid, serverValid,
 * payment_status, m_payment_id, pf_payment_id, amount_gross, item_name, email, raw
 */

// === CONFIG ===
const SPREADSHEET_ID = 'PUT_YOUR_SHEET_ID_HERE';
const SHEET_NAME = 'Orders';
const WEBHOOK_TOKEN = 'CHANGE_ME_SECURE_TOKEN'; // e.g. random string; must match ?token= in GAS_WEBHOOK_URL
const ADMIN_EMAIL = 'wykiesautomation@gmail.com';

function _getSheet_(){
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  const headers = ['timestamp','sandbox','ok','signatureValid','amountValid','serverValid','payment_status','m_payment_id','pf_payment_id','amount_gross','item_name','email','raw'];
  if (sheet.getLastRow() === 0){
    sheet.getRange(1,1,1,headers.length).setValues([headers]);
  }
  return sheet;
}

function doPost(e){
  try{
    // Security: token in query string must match
    const token = e && e.parameter && e.parameter.token;
    if (!token || token !== WEBHOOK_TOKEN){
      return _json_({ ok:false, error:'unauthorized' }, 401);
    }

    const raw = e?.postData?.contents || '{}';
    let obj;
    try { obj = JSON.parse(raw); } catch(err){ obj = { rawString: raw }; }

    // Normalize fields (matches what Netlify sends)
    const payload = obj || {};
    const row = [
      new Date(),
      payload.sandbox === true,
      !!payload.ok,
      !!payload.signatureValid,
      !!payload.amountValid,
      !!payload.serverValid,
      payload.payment_status || '',
      payload.m_payment_id || '',
      payload.pf_payment_id || '',
      payload.amount_gross || '',
      payload.item_name || '',
      payload.email || '',
      JSON.stringify(payload)
    ];

    const sheet = _getSheet_();
    sheet.appendRow(row);

    // Optional admin email (uses MailApp)
    const subject = (payload.ok ? 'PAID: ' : 'PAYMENT ALERT: ') + (payload.item_name || '') + ' (' + (payload.m_payment_id||'') + ')';
    const body = 'ITN received and logged.\n' + JSON.stringify(payload, null, 2);
    try{ MailApp.sendEmail(ADMIN_EMAIL, subject, body); } catch(e){ /* ignore */ }

    return _json_({ ok:true, stored:true });
  }catch(err){
    return _json_({ ok:false, error: String(err) });
  }
}

function _json_(obj, status){
  const out = ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  if (status && out.setStatusCode) out.setStatusCode(status);
  return out;
}

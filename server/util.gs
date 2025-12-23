
const CONFIG = {
  SHEET_ID: SpreadsheetApp.getActive().getId(),
  PRODUCTS_SHEET: 'Products',
  GALLERY_SHEET: 'Gallery',
  PAYMENTS_SHEET: 'Payments',
  ADMIN_EMAIL: PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL') || 'wykiesautomation@gmail.com',
  ADMIN_PASSPHRASE: PropertiesService.getScriptProperties().getProperty('ADMIN_PASSPHRASE') || 'Ford@20132016',
  PF_MERCHANT_ID: PropertiesService.getScriptProperties().getProperty('PF_MERCHANT_ID'),
  PF_MERCHANT_KEY: PropertiesService.getScriptProperties().getProperty('PF_MERCHANT_KEY'),
  PF_PASSPHRASE: PropertiesService.getScriptProperties().getProperty('PF_PASSPHRASE'),
  INVOICE_PREFIX: PropertiesService.getScriptProperties().getProperty('INVOICE_PREFIX') || 'INV-',
  VAT_RATE: 0.15,
};

function json(data){
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name){ return SpreadsheetApp.getActive().getSheetByName(name) || SpreadsheetApp.getActive().insertSheet(name); }

function readRows(sheet){
  const range = sheet.getDataRange();
  const values = range.getValues();
  const headers = values.shift();
  const items = values.map(r=>{
    const obj = {}; headers.forEach((h,i)=> obj[String(h).trim()] = r[i]); return obj;
  });
  return { headers, items };
}

function upsertRow(sheet, keyField, keyValue, data){
  const { headers, items } = readRows(sheet);
  let rowIndex = items.findIndex(x=> String(x[keyField]) === String(keyValue));
  if(rowIndex === -1){
    // append
    const row = headers.map(h=> data[h] !== undefined ? data[h] : '');
    sheet.appendRow(row);
  } else {
    const rowNumber = rowIndex + 2; // account for header
    headers.forEach((h,i)=> sheet.getRange(rowNumber, i+1).setValue(data[h] !== undefined ? data[h] : items[rowIndex][h]));
  }
}

function nextInvoiceNumber(){
  const last = PropertiesService.getScriptProperties().getProperty('LAST_INVOICE_NO') || '00000';
  const next = String(parseInt(last,10)+1).padStart(5,'0');
  PropertiesService.getScriptProperties().setProperty('LAST_INVOICE_NO', next);
  return CONFIG.INVOICE_PREFIX + next;
}

function validPayFastIP(ip){
  // Basic allow-list per PayFast docs (subject to change; update as needed)
  const allow = ['196.33.227.0', '196.33.227.1', '196.33.227.2', '41.74.179.'];// prefix example
  return allow.some(a=> ip.indexOf(a)===0);
}

function md5Signature(payload){
  // Build signature string and MD5 per PayFast
  const keys = Object.keys(payload).sort();
  const pairs = keys.map(k=> `${k}=${encodeURIComponent(payload[k])}`);
  let str = pairs.join('&');
  const passphrase = CONFIG.PF_PASSPHRASE || '';
  if(passphrase) str += `&passphrase=${encodeURIComponent(passphrase)}`;
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, str);
  return raw.map(b=> (b+256)%256).map(b=> ('0'+b.toString(16)).slice(-2)).join('');
}

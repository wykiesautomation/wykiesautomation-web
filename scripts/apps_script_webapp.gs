/**
 * Google Apps Script Web App for Wykies Automation
 * Sheets: Products, Gallery, Payments
 */
function doGet(e){
  const action = e.parameter.action || 'ping';
  if(action==='listProducts') return json(listProducts());
  return json({ok:true, action});
}

function doPost(e){
  const ct = e.postData.type;
  if(ct === 'application/json'){ return handleJson(JSON.parse(e.postData.contents||'{}')); }
  // handle multipart for image upload
  if(ct && ct.indexOf('multipart')>=0){ return handleMultipart(e); }
  return json({ok:false, error:'Unsupported content type'});
}

function handleJson(data){
  switch(data.action){
    case 'updateProduct': return json(updateProduct(data));
    case 'listProducts': return json(listProducts());
    case 'listPayments': return json(listPayments());
    case 'resendInvoice': return json(resendInvoice(data.invoiceNo));
    case 'contact': return json(sendContact(data));
    default: return json({ok:false, error:'Unknown action'});
  }
}

function handleMultipart(e){
  const sku = e.parameter.sku;
  const folder = getOrCreateFolder_('ProductImages');
  const files = e.postData.contents; // raw
  const blob = Utilities.newBlob(files, e.postData.type, sku + '.bin');
  // Attempt to parse multipart body
  const bl = e.postData;
  const mpBlob = bl.getDataAsString();
  // NOTE: A robust multipart parser should be used; for brevity we store raw blob
  const file = folder.createFile(blob);
  return json({ok:true, url:file.getUrl()});
}

function json(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getSs_(){
  const name = 'WykiesAutomationCMS';
  const files = DriveApp.getFilesByName(name);
  if(files.hasNext()) return SpreadsheetApp.open(files.next());
  const ss = SpreadsheetApp.create(name);
  ss.insertSheet('Products'); ss.insertSheet('Gallery'); ss.insertSheet('Payments');
  return ss;
}

function listProducts(){
  const sheet = getSs_().getSheetByName('Products');
  const data = sheet.getDataRange().getValues();
  if(data.length<=1){ // seed
    const headers = ['sku','name','price','summary','description','imageUrl','trialUrl','docUrl','active'];
    sheet.clear(); sheet.appendRow(headers);
  }
  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift();
  const out = rows.map(r=>{
    const o={}; headers.forEach((h,i)=>o[h]=r[i]); return o;
  });
  return out;
}

function updateProduct(p){
  const sheet = getSs_().getSheetByName('Products');
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const idxSku = headers.indexOf('sku');
  let rowIndex = -1;
  for(let i=0;i<data.length;i++){ if(data[i][idxSku]===p.sku){ rowIndex = i+2; break; } }
  if(rowIndex<0){ // append
    const row = headers.map(h=> p[h]!==undefined? p[h] : '');
    sheet.appendRow(row);
    return {ok:true, created:true};
  } else {
    const rowValues = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
    headers.forEach((h,i)=>{ if(p[h]!==undefined){ rowValues[i]=p[h]; }});
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowValues]);
    return {ok:true, updated:true};
  }
}

function listPayments(){
  const sheet = getSs_().getSheetByName('Payments');
  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); if(!headers) return [];
  return data.map(r=>{ const o={}; headers.forEach((h,i)=>o[h]=r[i]); return o; });
}

function resendInvoice(inv){
  // Placeholder: look up by invoice number and re-email
  return {ok:true};
}

function sendContact(payload){
  const to='wykiesautomation@gmail.com';
  const subject='Website contact: ' + (payload.product||'');
  const body=JSON.stringify(payload,null,2);
  MailApp.sendEmail(to, subject, body);
  return {ok:true};
}

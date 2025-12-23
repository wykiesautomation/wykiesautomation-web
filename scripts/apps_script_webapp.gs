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
    case 'importxlsx': return json(importXlsx(data.fileId));
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


/** Import Products/Gallery from an XLSX file on Drive (paste fileId in Admin) */
function importXlsx(fileId){
  try{
    // Requires Advanced Drive Service (Resources → Advanced Google services → Drive API v2 ON)
    var resource = { title: 'WA_Import_'+Date.now(), mimeType: 'application/vnd.google-apps.spreadsheet' };
    var copied = Drive.Files.copy(resource, fileId, {convert: true});
    var ss = SpreadsheetApp.openById(copied.id);
    // Read Products
    var psh = ss.getSheetByName('Products') || ss.getSheets()[0];
    var pdata = psh.getDataRange().getValues();
    var pheaders = pdata.shift();
    var target = getSs_().getSheetByName('Products');
    // Ensure header order
    var headers = ['sku','name','price','summary','description','imageUrl','trialUrl','docUrl','active'];
    target.clear(); target.appendRow(headers);
    for (var i=0;i<pdata.length;i++){
      if (!pdata[i] || pdata[i].length===0) continue;
      var rowObj = {}; pheaders.forEach(function(h,idx){ rowObj[String(h).trim()] = pdata[i][idx]; });
      var row = headers.map(function(h){ return rowObj[h]!==undefined? rowObj[h] : '' });
      if (row[0]) target.appendRow(row);
    }
    // Optional: Gallery
    var gsh = ss.getSheetByName('Gallery');
    if (gsh){
      var gdata = gsh.getDataRange().getValues();
      var gheaders = gdata.shift();
      var gtarget = getSs_().getSheetByName('Gallery');
      if (!gtarget) { getSs_().insertSheet('Gallery'); gtarget = getSs_().getSheetByName('Gallery'); }
      gtarget.clear(); gtarget.appendRow(['url','caption','created']);
      for (var j=0;j<gdata.length;j++){
        var go={}; gheaders.forEach(function(h,idx){ go[String(h).trim()] = gdata[j][idx]; });
        gtarget.appendRow([go.url||'', go.caption||'', go.created||'']);
      }
    }
    return {ok:true, imported:true};
  }catch(err){
    return {ok:false, error:String(err)};
  }
}

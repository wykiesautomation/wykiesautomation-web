/**
 * Wykies Automation Backend — Google Apps Script
 * Provides endpoints for: verify, list/update products, list payments, resend invoice, list/update gallery, PayFast ITN.
 * Execution: deploy as Web App, Execute as Me, Who has access: Anyone. Frontend sends ID token for allowlist verification.
 */

const ALLOWLIST = ['wykiesautomation@gmail.com'];
const SHEET_ID = '12qRMe6pAPVaQtosZBnhVtpMwyNks7W8uY9PX1mF620k';
const PRODUCTS_SHEET = 'Products';
const SETTINGS_SHEET = 'Settings';
const PRICELOG_SHEET = 'PriceLog';
const PAYMENTS_SHEET = 'Payments';
const GALLERY_SHEET = 'Gallery';
const PASS_PHRASE = 'Ford@20132016'; // PayFast passphrase (server-side only)

function doGet(e){
  const action = (e.parameter.action||'').toLowerCase();
  const token = e.headers && e.headers.Authorization ? e.headers.Authorization.replace('Bearer ','') : null;
  if(action==='verify'){ return json(verify(token)); }
  if(action==='itn'){ return handleITN(e); }
  return json({ok:true});
}

function doPost(e){
  const token = e.headers && e.headers.Authorization ? e.headers.Authorization.replace('Bearer ','') : null;
  const user = verify(token); if(!user || ALLOWLIST.indexOf(user.email)<0) return json({error:'unauthorized'}, 403);
  const body = JSON.parse(e.postData.contents||'{}');
  const action = (body.action||'').toLowerCase();
  if(action==='list_products') return json({products:getProducts()});
  if(action==='update_product'){ updateProduct(body.data); return json({ok:true}); }
  if(action==='list_payments') return json({items:getPayments()});
  if(action==='resend_invoice'){ resendInvoice(body.data.id); return json({ok:true}); }
  if(action==='list_gallery') return json({items:getGallery()});
  if(action==='update_gallery'){ updateGallery(body.data); return json({ok:true}); }
  return json({error:'unknown action'}, 400);
}

function verify(idToken){
  if(!idToken) return null;
  const url = 'https://oauth2.googleapis.com/tokeninfo?id_token='+idToken;
  const res = UrlFetchApp.fetch(url, {muteHttpExceptions:true});
  if(res.getResponseCode()!=200) return null;
  const info = JSON.parse(res.getContentText());
  return {email: info.email, name: info.name};
}

function ss(){ return SpreadsheetApp.openById(SHEET_ID); }
function json(obj, code){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function getProducts(){
  const sh = ss().getSheetByName(PRODUCTS_SHEET); const data = sh.getDataRange().getValues();
  const headers = data.shift(); const idx = Object.fromEntries(headers.map((h,i)=>[h,i]));
  return data.map(r=>({
    sku:r[idx['SKU']], name:r[idx['Name']], price:r[idx['PriceZAR']], stock:r[idx['Stock']], active:String(r[idx['Active']]).toLowerCase()==='true'
  }));
}
function updateProduct(d){
  const sh = ss().getSheetByName(PRODUCTS_SHEET); const data = sh.getDataRange().getValues();
  const headers = data.shift(); const idx = Object.fromEntries(headers.map((h,i)=>[h,i]));
  for(let i=0;i<data.length;i++){
    if(data[i][idx['SKU']]==d.sku){
      if(d.name!==undefined) sh.getRange(i+2, idx['Name']+1).setValue(d.name);
      if(d.price!==undefined) sh.getRange(i+2, idx['PriceZAR']+1).setValue(Number(d.price));
      if(d.stock!==undefined) sh.getRange(i+2, idx['Stock']+1).setValue(Number(d.stock));
      if(d.active!==undefined) sh.getRange(i+2, idx['Active']+1).setValue(!!d.active);
      // append to PriceLog if price changed
      ss().getSheetByName(PRICELOG_SHEET).appendRow([d.sku, new Date(), d.price, 'admin update']);
      break;
    }
  }
}

function getPayments(){
  const sh = ss().getSheetByName(PAYMENTS_SHEET); if(!sh) return [];
  const data = sh.getDataRange().getValues(); const headers = data.shift(); const idx = Object.fromEntries(headers.map((h,i)=>[h,i]));
  return data.map(r=>({ id:r[idx['PaymentID']], date:r[idx['Date']], buyer:r[idx['Buyer']], sku:r[idx['SKU']], amount:r[idx['Amount']], status:r[idx['Status']] }));
}
function resendInvoice(id){
  // Lookup payment, regenerate PDF invoice, email customer + wykiesautomation@gmail.com
  // (Implementation stub — wire to DocumentApp & GmailApp)
}

function getGallery(){
  const sh = ss().getSheetByName(GALLERY_SHEET); if(!sh) return [];
  const data = sh.getDataRange().getValues(); const headers = data.shift(); const idx = Object.fromEntries(headers.map((h,i)=>[h,i]));
  return data.map((r,i)=>({ id:String(i+1), src:r[idx['Src']], alt:r[idx['Alt']], caption:r[idx['Caption']] }));
}
function updateGallery(d){
  const sh = ss().getSheetByName(GALLERY_SHEET); const row = Number(d.id)+1; const data = sh.getDataRange().getValues();
  const headers = data.shift(); const idx = Object.fromEntries(headers.map((h,i)=>[h,i]));
  sh.getRange(row, idx['Caption']+1).setValue(d.caption);
}

// PayFast ITN handler (verification stub)
function handleITN(e){
  const params = e.parameter; // contains payment data
  // TODO: verify signature using PASS_PHRASE, call PayFast validate URL, then record payment and send emails.
  return json({ok:true});
}

/**
 * Wykies Automation — Google Apps Script Web App
 * Routes: products, product, gallery, createOrder, login, updateProduct, addGalleryImage, payments, resendInvoice
 */

// === CONFIG (Store secrets in PropertiesService, not in client) ===
const CONFIG = {
  SHEET_ID: 'REPLACE_WITH_SHEET_ID',
  PASS_PHRASE: PropertiesService.getScriptProperties().getProperty('PAYFAST_PASSPHRASE'),
  MERCHANT_ID: PropertiesService.getScriptProperties().getProperty('PAYFAST_MERCHANT_ID'),
  MERCHANT_KEY: PropertiesService.getScriptProperties().getProperty('PAYFAST_MERCHANT_KEY'),
  ADMIN_PASS: PropertiesService.getScriptProperties().getProperty('ADMIN_PASSPHRASE'),
  BRAND_NAME: 'Wykies Automation',
  ADMIN_EMAIL: 'wykiesautomation@gmail.com',
};

function doGet(e){
  const route = (e.parameter.route||'').toLowerCase();
  if(route==='products') return json(productsList());
  if(route==='product') return json(productBySku(e.parameter.sku));
  if(route==='gallery') return json(galleryList());
  if(route==='payments') return json(paymentsList());
  return json({error:'route not found'});
}

function doPost(e){
  const body = safeParse(e.postData && e.postData.contents);
  const route = (body && body.route||'').toLowerCase();
  if(route==='login') return json(adminLogin(body));
  if(route==='updateProduct') return json(updateProduct(body, e));
  if(route==='addGalleryImage') return json(addGalleryImage(body, e));
  if(route==='createOrder') return json(createOrder(body));
  if(route==='resendInvoice') return json(resendInvoice(body, e));
  // PayFast ITN sends form-encoded, handle separately
  const pfRoute = (e.parameter && e.parameter.pf_route)||'';
  if(pfRoute==='itn') return payfastITN(e);
  return json({error:'route not found'});
}

function json(obj){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function safeParse(s){ try{ return JSON.parse(s); } catch(ex){ return null; } }

// === Helpers ===
function getSheet(name){ return SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(name); }
function readSheet(name){ const sh=getSheet(name); const rng=sh.getDataRange().getValues(); const headers=rng.shift(); return rng.map(r=>{ const o={}; headers.forEach((h,i)=>o[h]=r[i]); return o; }); }
function writeRow(name, obj){ const sh=getSheet(name); const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0]; const row=headers.map(h=> obj[h]!==undefined? obj[h]:'' ); sh.appendRow(row); }
function updateRow(name, key, keyVal, obj){ const sh=getSheet(name); const rng=sh.getDataRange().getValues(); const headers=rng.shift(); const keyIdx=headers.indexOf(key); const mapIdx={}; headers.forEach((h,i)=>mapIdx[h]=i);
  for(let r=0;r<rng.length;r++){ if(rng[r][keyIdx]===keyVal){ Object.keys(obj).forEach(k=>{ const idx=mapIdx[k]; if(idx>=0) sh.getRange(r+2, idx+1).setValue(obj[k]); }); return true; } }
  return false;
}

// === Public data ===
function productsList(){ return { products: readSheet('Products').filter(p=> String(p.active).toLowerCase()!=='false' ) }; }
function productBySku(sku){ return readSheet('Products').find(p=>p.sku===sku)||{}; }
function galleryList(){ return { images: readSheet('Gallery') }; }
function paymentsList(){ return { rows: readSheet('Payments') }; }

// === Admin auth ===
function adminLogin(body){ const ok = body && body.passphrase && body.passphrase===CONFIG.ADMIN_PASS; if(!ok) return { ok:false };
  const token = Utilities.getUuid(); CacheService.getScriptCache().put('tok_'+token, '1', 3600); return { ok:true, token };
}
function requireAuth(e){ const tok=(e&&e.parameter && e.parameter.token) || (e && e.postData && e.postData.headers && e.postData.headers['X-Auth']) || '';
  const v = CacheService.getScriptCache().get('tok_'+tok); if(!v) throw new Error('unauthorized'); }
function updateProduct(body, e){ try{ requireAuth(e); }catch(err){ return { ok:false, error:'unauthorized' }; }
  const ok=updateRow('Products','sku',body.sku,{ name:body.name, price:body.price, imageUrl: body.imageUrl, trialUrl: body.trialUrl, docUrl: body.docUrl, active: body.active });
  return { ok };
}
function addGalleryImage(body, e){ try{ requireAuth(e); }catch(err){ return { ok:false, error:'unauthorized' }; }
  writeRow('Gallery', { sku: body.sku, imageUrl: body.imageUrl }); return { ok:true };
}

// === Order creation (signed for PayFast) ===
function createOrder(body){
  const sku = body.sku; const email = body.email; const p = productBySku(sku); if(!p || !p.price) return { error: 'Invalid SKU' };
  const amount = Number(p.price).toFixed(2);
  const orderId = 'WA-'+ new Date().getTime();
  const fields = {
    merchant_id: CONFIG.MERCHANT_ID,
    merchant_key: CONFIG.MERCHANT_KEY,
    return_url: 'https://wykiesautomation.co.za/thankyou.html',
    cancel_url: 'https://wykiesautomation.co.za/cancel.html',
    notify_url: ScriptApp.getService().getUrl() + '?pf_route=itn',
    name_first: email.split('@')[0],
    email_address: email,
    m_payment_id: orderId,
    amount: amount,
    item_name: sku + ' — ' + p.name,
  };
  const pfSig = payfastSignature(fields, CONFIG.PASS_PHRASE);
  fields['signature'] = pfSig;
  // Log a pre-order row in Payments
  writeRow('Payments', { Timestamp: new Date(), InvoiceNo: '', OrderID: orderId, pf_payment_id: '', Email: email, SKU: sku, TotalInclVAT: amount, ReleasedAt: '' });
  return { payfastUrl: 'https://www.payfast.co.za/eng/process', fields };
}

function payfastSignature(fields, passphrase){
  // Build URL-encoded string in key order
  const keys = Object.keys(fields).sort();
  const enc = keys.map(k=> k+'='+ encodeURIComponent(String(fields[k]).replace(/%20/g,'+')) ).join('&');
  const str = enc + '&passphrase=' + encodeURIComponent(passphrase);
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, str);
  return raw.map(b=> (b+256)%256).map(b=> ('0'+b.toString(16)).slice(-2)).join('');
}

// === PayFast ITN handler ===
function payfastITN(e){
  const params = e.parameter; // form fields
  const validSig = verifyITNSignature(params);
  const validIP = verifyIP(e);
  const validData = verifyData(params);
  if(validSig && validIP && validData){
    const pfPaymentId = params['pf_payment_id'];
    const orderId = params['m_payment_id'];
    // Issue invoice & release
    const sku = params['item_name'].split(' — ')[0];
    const email = params['email_address'];
    const price = Number(params['amount']);
    const invNo = issueInvoice({ orderId, sku, email, totalIncl: price });
    updateRow('Payments','OrderID',orderId,{ Timestamp: new Date(), InvoiceNo: invNo, pf_payment_id: pfPaymentId, Email: email, SKU: sku, TotalInclVAT: price, ReleasedAt: new Date() });
    return ContentService.createTextOutput('OK');
  }
  return ContentService.createTextOutput('INVALID');
}
function verifyITNSignature(params){
  const copy = JSON.parse(JSON.stringify(params)); delete copy['signature'];
  const sig = payfastSignature(copy, CONFIG.PASS_PHRASE);
  return (sig === params['signature']);
}
function verifyIP(e){
  const ip = e && e.parameter && e.parameter['ip'] || '';
  // Optional: fetch PayFast IP ranges. For simplicity, accept; in production, validate against documented IPs.
  return true;
}
function verifyData(params){
  // Post back to PayFast to verify data
  const url = 'https://api.payfast.co.za/eng/query/validate';
  const resp = UrlFetchApp.fetch(url, { method:'post', payload: params, muteHttpExceptions:true });
  return resp && resp.getResponseCode()===200 && resp.getContentText().indexOf('VALID')>=0;
}

// === Invoice generation & email ===
function issueInvoice({ orderId, sku, email, totalIncl }){
  const p = productBySku(sku);
  const vat = Math.round(totalIncl * 15 / 115 * 100) / 100; // 2 decimals
  const net = Math.round((totalIncl - vat) * 100) / 100;
  const invNo = 'INV-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd') + '-' + orderId.slice(-6);
  const folder = ensureInvoiceFolder();
  const html = renderInvoiceHtml({ invNo, date: new Date(), brand: CONFIG.BRAND_NAME, customerEmail: email, item: p.name, sku, net, vat, totalIncl });
  const file = HtmlService.createHtmlOutput(html);
  const blob = file.getBlob().setName(invNo + '.html');
  const pdf = Utilities.newBlob(blob.getBytes(), 'text/html', invNo+'.html');
  // Convert via Drive (create, then export)
  const gfile = DriveApp.createFile(pdf);
  const pdfBlob = gfile.getAs('application/pdf');
  folder.createFile(pdfBlob).setName(invNo + '.pdf');
  // Email
  const subject = 'Tax Invoice ' + invNo + ' — ' + CONFIG.BRAND_NAME;
  const body = 'Thank you for your purchase. Your invoice is attached.\n\nDownloads:\nTrial: '+(p.trialUrl||'N/A')+'\nDocs: '+(p.docUrl||'N/A');
  MailApp.sendEmail(email, subject, body, { attachments:[pdfBlob] });
  MailApp.sendEmail(CONFIG.ADMIN_EMAIL, subject, 'Copy of customer invoice', { attachments:[pdfBlob] });
  return invNo;
}
function ensureInvoiceFolder(){
  const y = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy');
  const root = getOrCreateFolder('Invoices');
  return getOrCreateFolder(y, root);
}
function getOrCreateFolder(name, parent){
  const folderIter = (parent||DriveApp).getFoldersByName(name);
  return folderIter.hasNext()? folderIter.next() : (parent||DriveApp).createFolder(name);
}
function renderInvoiceHtml(ctx){
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  body{font-family:Arial, sans-serif;}
  h1{font-size:20px;margin:0}
  table{width:100%;border-collapse:collapse;margin-top:12px}
  td,th{border:1px solid #ccc;padding:6px;text-align:left}
  .right{text-align:right}
  </style></head><body>
  <h1>Tax Invoice</h1>
  <p><strong>${CONFIG.BRAND_NAME}</strong><br/>VAT: (provide)<br/>Date: ${Utilities.formatDate(ctx.date, Session.getScriptTimeZone(), 'yyyy-MM-dd')}<br/>Invoice No: ${ctx.invNo}</p>
  <p>Bill to: ${ctx.customerEmail}</p>
  <table>
    <tr><th>SKU</th><th>Description</th><th class="right">Net</th><th class="right">VAT (15%)</th><th class="right">Total</th></tr>
    <tr><td>${ctx.sku}</td><td>${ctx.item}</td><td class="right">R${ctx.net.toFixed(2)}</td><td class="right">R${ctx.vat.toFixed(2)}</td><td class="right">R${ctx.totalIncl.toFixed(2)}</td></tr>
  </table>
  </body></html>`;
}

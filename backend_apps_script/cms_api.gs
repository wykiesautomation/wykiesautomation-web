
/**
 * Wykies Automation — Google Apps Script backend
 * Sheets: Products, Gallery, Payments
 * Web App routes: /auth, /load, /saveProduct, /deleteProduct, /saveGallery, /deleteGallery
 * ITN: doPostITN(e) — PayFast Instant Transaction Notification
 */

// === CONFIG ===
const CONFIG = {
  PASSPHRASE: 'Ford@20132016', // Admin passphrase
  SHEET_ID: '<<GOOGLE_SHEET_ID>>',
  PRODUCTS: 'Products',
  GALLERY: 'Gallery',
  PAYMENTS: 'Payments',
  MERCHANT_ID: '32913011',
  MERCHANT_KEY: '8wd7iwcgippud',
  PAYFAST_PASSPHRASE: 'Ford@20132016',
  INVOICE_ROOT: 'Invoices', // Drive root folder name
  AMOUNT_TOLERANCE: 0.01,   // ±R0.01 tolerance for floating point/rounding
  SUPPLIER: { name: 'Wykies Automation', vatRate: 0.15, email: 'wykiesautomation@gmail.com' }
};

// === Web App (CMS API) ===
function doPost(e){
  const path = e.parameter && e.parameter.path || '';
  const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
  if(!body || body.token !== CONFIG.PASSPHRASE){ return json({ error: 'unauthorized' }); }
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  switch(path){
    case '/auth': return json({ ok: true });
    case '/load': return json(loadAll(sheet));
    case '/saveProduct': upsertProduct(sheet, body.product); return json({ ok: true });
    case '/deleteProduct': deleteProduct(sheet, body.sku); return json({ ok: true });
    case '/saveGallery': upsertGallery(sheet, body.entry); return json({ ok: true });
    case '/deleteGallery': deleteGallery(sheet, body.url); return json({ ok: true });
    case '/resendInvoice': return json(resendInvoice(sheet, body.invoiceNo));
    default: return json({ error: 'unknown_route' });
  }
}

function json(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function loadAll(ss){
  return {
    products: readSheet(ss, CONFIG.PRODUCTS),
    gallery: readSheet(ss, CONFIG.GALLERY),
    payments: readSheet(ss, CONFIG.PAYMENTS)
  };
}

function readSheet(ss, name){
  const sh = ss.getSheetByName(name); const vals = sh.getDataRange().getValues();
  const head = vals.shift(); const out=[];
  vals.forEach(r=>{ const o={}; head.forEach((h,i)=> o[h]=r[i]); out.push(o); });
  return out;
}

function writeSheet(ss, name, rows){
  const sh = ss.getSheetByName(name); const head = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const out = [head]; rows.forEach(r=>{ const row = head.map(h => r[h]); out.push(row); });
  sh.clearContents(); sh.getRange(1,1,out.length,head.length).setValues(out);
}

function upsertProduct(ss, p){
  const rows = readSheet(ss, CONFIG.PRODUCTS);
  let idx = rows.findIndex(x => String(x.sku).trim() === String(p.sku).trim());
  if(idx < 0){ rows.push(p); } else { rows[idx] = p; }
  writeSheet(ss, CONFIG.PRODUCTS, rows);
}

function deleteProduct(ss, sku){
  const rows = readSheet(ss, CONFIG.PRODUCTS).filter(x => String(x.sku).trim() !== String(sku).trim());
  writeSheet(ss, CONFIG.PRODUCTS, rows);
}

function upsertGallery(ss, g){
  const rows = readSheet(ss, CONFIG.GALLERY);
  let idx = rows.findIndex(x => String(x.url).trim() === String(g.url).trim());
  if(idx < 0){ rows.push(g); } else { rows[idx] = g; }
  writeSheet(ss, CONFIG.GALLERY, rows);
}

function deleteGallery(ss, url){
  const rows = readSheet(ss, CONFIG.GALLERY).filter(x => String(x.url).trim() !== String(url).trim());
  writeSheet(ss, CONFIG.GALLERY, rows);
}

// === PayFast ITN Endpoint ===
function doPostITN(e){
  const params = e.parameter || {};
  // 1) Validate signature
  const valid = validatePayFast(params, CONFIG.PAYFAST_PASSPHRASE);
  if(!valid){ return ContentService.createTextOutput('invalid_signature').setMimeType(ContentService.MimeType.TEXT); }

  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const products = readSheet(ss, CONFIG.PRODUCTS);
  // PayFast commonly sends item_name as our SKU; fallback to m_payment_id when needed
  const sku = params.item_name || params.m_payment_id;
  const email = params.email_address || params.email_confirmation || '';
  const gross = parseFloat(params.amount_gross || params.amount || 0);
  const p = products.find(x => String(x.sku) === String(sku));
  if(!p){ return ContentService.createTextOutput('unknown_sku').setMimeType(ContentService.MimeType.TEXT); }

  // 2) Amount verification with tolerance
  const expected = toNumber(p.price);
  if(!amountMatches(expected, gross, CONFIG.AMOUNT_TOLERANCE)){
    // Log mismatch row for auditing
    const sh = ss.getSheetByName(CONFIG.PAYMENTS);
    sh.appendRow([new Date(), 'AMOUNT_MISMATCH', params.pf_payment_id||'', params.m_payment_id||'', email, sku, gross, '']);
    return ContentService.createTextOutput('amount_mismatch').setMimeType(ContentService.MimeType.TEXT);
  }

  // 3) Issue invoice (organized by date) and log payment
  const invoiceNo = issueInvoice(ss, { email: email, sku: sku, amount: gross, pf_payment_id: params.pf_payment_id });
  return ContentService.createTextOutput('ok:'+invoiceNo).setMimeType(ContentService.MimeType.TEXT);
}

function toNumber(v){
  if(typeof v === 'number') return v;
  if(typeof v === 'string') return parseFloat(v.replace(/[^0-9.\-]/g,''));
  return 0;
}

function amountMatches(expected, actual, tol){
  // Compare with ±tol, also allow rounding to cents
  const diff = Math.abs((expected||0) - (actual||0));
  return diff <= (tol||0.01);
}

function validatePayFast(params, passphrase){
  // Build signature string exactly as PayFast: sort keys, exclude 'signature', URL-encode, append passphrase
  const keys = Object.keys(params).filter(k => k !== 'signature').sort();
  const pairs = [];
  keys.forEach(k => { pairs.push(encodeURIComponent(k)+'='+encodeURIComponent(params[k])); });
  if(passphrase){ pairs.push('passphrase='+encodeURIComponent(passphrase)); }
  const str = pairs.join('&');
  const sig = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, str, Utilities.Charset.UTF_8);
  const hex = sig.map(b=> (b+256)%256).map(b=> ('0'+b.toString(16)).slice(-2)).join('');
  return (hex === String(params.signature).toLowerCase());
}

// === Invoice (organized by date: Invoices/YYYY/MM) ===
function issueInvoice(ss, info){
  const now = new Date();
  const yyyy = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy');
  const mm = Utilities.formatDate(now, Session.getScriptTimeZone(), 'MM');
  const root = getOrCreateFolder(CONFIG.INVOICE_ROOT);
  const yearFolder = getOrCreateSubFolder(root, yyyy);
  const monthFolder = getOrCreateSubFolder(yearFolder, mm);

  const invoiceNo = 'INV-' + Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  const html = HtmlService.createTemplateFromFile('invoice').evaluate().getContent()
    .replace('{{SUPPLIER_NAME}}', CONFIG.SUPPLIER.name)
    .replace('{{INVOICE_NO}}', invoiceNo)
    .replace('{{DATE}}', Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd'))
    .replace('{{ITEM}}', info.sku)
    .replace('{{AMOUNT}}', 'R'+info.amount.toFixed(2))
    .replace('{{VAT}}', '15%');
  const blob = Utilities.newBlob(html, 'text/html', invoiceNo + '.html');
  const htmlFile = monthFolder.createFile(blob);
  const pdf = htmlFile.getAs('application/pdf');
  pdf.setName(invoiceNo + '.pdf');
  monthFolder.createFile(pdf);

  // Log to Payments sheet
  const sh = ss.getSheetByName(CONFIG.PAYMENTS);
  sh.appendRow([new Date(), invoiceNo, info.pf_payment_id||'', info.pf_payment_id||'', info.email, info.sku, info.amount, new Date()]);

  // Email
  MailApp.sendEmail({ to: info.email, cc: CONFIG.SUPPLIER.email, subject: 'Tax Invoice '+invoiceNo, htmlBody: 'Thank you for your purchase. Attached is your invoice.', attachments: [pdf] });
  return invoiceNo;
}

function getOrCreateFolder(name){
  const it = DriveApp.getFoldersByName(name);
  if(it.hasNext()) return it.next();
  return DriveApp.createFolder(name);
}

function getOrCreateSubFolder(parent, name){
  const it = parent.getFoldersByName(name);
  if(it.hasNext()) return it.next();
  return parent.createFolder(name);
}


function resendInvoice(ss, invoiceNo){
  try{
    // Find payment row
    const payments = readSheet(ss, CONFIG.PAYMENTS);
    const rec = payments.find(r => String(r.InvoiceNo) === String(invoiceNo));
    if(!rec){ return { ok:false, error:'not_found' }; }
    const to = rec.Email || CONFIG.SUPPLIER.email;
    const sku = rec.SKU;
    const amount = toNumber(rec.TotalInclVAT);

    // Try find existing PDF by name
    let pdfFile = null;
    const it = DriveApp.getFilesByName(invoiceNo + '.pdf');
    if(it.hasNext()){ pdfFile = it.next(); }
    else {
      // Recreate PDF using invoice template and current date folders
      const now = new Date();
      const yyyy = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy');
      const mm = Utilities.formatDate(now, Session.getScriptTimeZone(), 'MM');
      const root = getOrCreateFolder(CONFIG.INVOICE_ROOT);
      const yearFolder = getOrCreateSubFolder(root, yyyy);
      const monthFolder = getOrCreateSubFolder(yearFolder, mm);
      const html = HtmlService.createTemplateFromFile('invoice').evaluate().getContent()
        .replace('{{SUPPLIER_NAME}}', CONFIG.SUPPLIER.name)
        .replace('{{INVOICE_NO}}', invoiceNo)
        .replace('{{DATE}}', Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd'))
        .replace('{{ITEM}}', sku)
        .replace('{{AMOUNT}}', 'R'+(amount||0).toFixed(2))
        .replace('{{VAT}}', '15%');
      const blob = Utilities.newBlob(html, 'text/html', invoiceNo + '.html');
      const htmlFile = monthFolder.createFile(blob);
      const pdf = htmlFile.getAs('application/pdf');
      pdf.setName(invoiceNo + '.pdf');
      monthFolder.createFile(pdf);
      pdfFile = pdf;
    }

    MailApp.sendEmail({ to: to, cc: CONFIG.SUPPLIER.email, subject: 'Tax Invoice '+invoiceNo, htmlBody: 'Your invoice is attached.', attachments: [pdfFile] });
    return { ok:true };
  }catch(err){
    return { ok:false, error: String(err) };
  }
}

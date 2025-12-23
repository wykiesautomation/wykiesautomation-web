
/**
 * Wykies Automation Apps Script backend (Web App)
 * Actions: products, gallery, payments, login, contact, updateProduct, addGalleryImage, resendInvoice, itn
 */

// ===== CONFIG VIA SCRIPT PROPERTIES =====
// Set these in Apps Script: Project Settings → Script properties
// SPREADSHEET_ID, ADMIN_PASSPHRASE_SHA256, ADMIN_EMAIL, MERCHANT_ID, MERCHANT_KEY,
// PAYFAST_PASSPHRASE, INVOICE_TEMPLATE_ID, INVOICE_FOLDER_ID, INVOICE_SEQ (optional)

const SP = PropertiesService.getScriptProperties();
const SHEETS = {
  PRODUCTS: 'Products',
  GALLERY: 'Gallery',
  PAYMENTS: 'Payments'
};

function _cors(resp){
  return ContentService.createTextOutput(JSON.stringify(resp))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e){
  try{
    const action = (e.parameter.action||'').toLowerCase();
    if(action==='products') return _cors({ok:true, items:listProducts()});
    if(action==='gallery')  return _cors({ok:true, items:listGallery()});
    if(action==='payments') return _cors({ok:true, items:listPayments()});
    return _cors({ok:false, error:'Unknown action'});
  }catch(err){
    return _cors({ok:false, error:String(err)});
  }
}

function doPost(e){
  try{
    const ctype = e.postData && e.postData.type || '';
    if((e.parameter && e.parameter.action==='itn') || (ctype==='application/x-www-form-urlencoded' && e.postData.contents.indexOf('payment_status')>-1)){
      return handleITN(e);
    }
    const body = e.postData ? (ctype.indexOf('json')>-1 ? JSON.parse(e.postData.contents||'{}') : JSON.parse(e.postData.contents||'{}')) : {};
    const action = (body.action||'').toLowerCase();
    if(action==='login') return _cors(adminLogin(body));
    if(action==='contact') return _cors(contact(body));
    if(action==='updateproduct') return _cors(updateProduct(body));
    if(action==='addgalleryimage') return _cors(addGalleryImage(body));
    if(action==='resendinvoice') return _cors(resendInvoice(body));
    return _cors({ok:false, error:'Unknown action'});
  }catch(err){
    return _cors({ok:false, error:String(err)});
  }
}

// ===== SHEETS HELPERS =====
function getSS(){
  const id = SP.getProperty('SPREADSHEET_ID');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActive();
}

function _getSheet(name){
  const ss = getSS();
  let sh = ss.getSheetByName(name);
  if(!sh){ sh = ss.insertSheet(name); }
  return sh;
}

function listProducts(){
  const sh = _getSheet(SHEETS.PRODUCTS);
  const rng = sh.getDataRange().getValues();
  const head = rng.shift();
  const items = rng.filter(r=>r.join('').length>0).map(r=>Object.fromEntries(head.map((h,i)=>[h, r[i]])));
  return items;
}

function listGallery(){
  const sh = _getSheet(SHEETS.GALLERY);
  const rng = sh.getDataRange().getValues();
  const head = rng.shift();
  const items = rng.filter(r=>r.join('').length>0).map(r=>Object.fromEntries(head.map((h,i)=>[h, r[i]])));
  return items;
}

function listPayments(){
  const sh = _getSheet(SHEETS.PAYMENTS);
  const rng = sh.getDataRange().getValues();
  const head = rng.shift();
  const items = rng.filter(r=>r.join('').length>0).map(r=>Object.fromEntries(head.map((h,i)=>[h, r[i]])));
  return items.reverse();
}

// ===== ADMIN & CMS =====
function adminLogin(body){
  const pass = (body.passphrase||'').trim();
  if(!pass) return {ok:false};
  const want = SP.getProperty('ADMIN_PASSPHRASE_SHA256')||'';
  const got = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pass).map(b=>('0'+(b&0xff).toString(16)).slice(-2)).join('');
  if(got.toLowerCase()===String(want).toLowerCase()){
    return {ok:true, token:'ok'}; // simple token; enhance if needed
  }
  return {ok:false};
}

function updateProduct(b){
  const sh = _getSheet(SHEETS.PRODUCTS);
  const rng = sh.getDataRange(); const vals = rng.getValues(); const head = vals.shift();
  const idxSku = head.indexOf('sku'); if(idxSku<0) throw new Error('sku column missing');
  for(let r=0;r<vals.length;r++){
    if(vals[r][idxSku]===b.sku){
      head.forEach((h,i)=>{ if(h in b && h!=='sku') vals[r][i]=b[h]; });
      rng.offset(1,0,vals.length, head.length).setValues(vals);
      return {ok:true};
    }
  }
  // append if not found
  const row = head.map(h=> h==='sku'?b.sku:(h in b? b[h]:''));
  sh.appendRow(row);
  return {ok:true, created:true};
}

function addGalleryImage(b){
  const sh = _getSheet(SHEETS.GALLERY);
  const head = sh.getDataRange().getValues()[0];
  const row = head.map(h=> h==='url'?b.url : h==='caption'? b.caption : h==='active'?'true':'');
  sh.appendRow(row);
  return {ok:true};
}

function contact(b){
  const admin = SP.getProperty('ADMIN_EMAIL');
  const name = b.name||''; const email=b.email||''; const phone=b.phone||''; const product=b.product||''; const msg=b.message||'';
  const subject = `Contact: ${product||'General'} — ${name}`;
  const body = `From: ${name}\nEmail: ${email}\nPhone: ${phone}\nProduct: ${product}\n\n${msg}`;
  if(admin){ MailApp.sendEmail(admin, subject, body); }
  if(b.copyMe && email){ MailApp.sendEmail(email, 'Copy — '+subject, body); }
  return {ok:true};
}

// ===== INVOICE =====
function nextInvoiceNo(){
  let seq = Number(SP.getProperty('INVOICE_SEQ')||'0')+1; SP.setProperty('INVOICE_SEQ', String(seq));
  return 'INV-'+('000000'+seq).slice(-6);
}

function generateInvoicePDF(data){
  const tplId = SP.getProperty('INVOICE_TEMPLATE_ID');
  if(!tplId) throw new Error('INVOICE_TEMPLATE_ID not set');
  const folderId = SP.getProperty('INVOICE_FOLDER_ID');
  const folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
  const yFolderName = String(new Date().getFullYear());
  let yearFolder;
  const it = folder.getFoldersByName(yFolderName);
  yearFolder = it.hasNext()? it.next() : folder.createFolder(yFolderName);

  const copy = DriveApp.getFileById(tplId).makeCopy(`${data.InvoiceNo} - ${data.SKU}`, yearFolder);
  const doc = DocumentApp.openById(copy.getId());
  let body = doc.getBody();
  const rep = new Map(Object.entries({
    '{{INVOICE_NO}}': data.InvoiceNo,
    '{{DATE}}': Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    '{{BILL_TO_NAME}}': data.CustomerName||'',
    '{{BILL_TO_EMAIL}}': data.Email||'',
    '{{ORDER_ID}}': data.OrderID||'',
    '{{SKU}}': data.SKU||'',
    '{{ITEM_DESC}}': data.ItemName||data.SKU,
    '{{QTY}}': '1',
    '{{NET}}': data.Net.toFixed(2),
    '{{VAT}}': data.VAT.toFixed(2),
    '{{TOTAL}}': data.Total.toFixed(2)
  }));
  rep.forEach((v,k)=> body.replaceText(k, v));
  doc.saveAndClose();
  const pdf = DriveApp.getFileById(copy.getId()).getAs('application/pdf');
  return {pdfBlob: pdf, fileId: copy.getId()};
}

function emailInvoice(data, pdfBlob){
  const admin = SP.getProperty('ADMIN_EMAIL');
  const subject = `Tax Invoice ${data.InvoiceNo} — ${data.SKU} — Order ${data.OrderID}`;
  const body = `Dear Customer,\n\nThank you for your purchase.\n\nInvoice: ${data.InvoiceNo}\nOrder ID: ${data.OrderID}\nProduct: ${data.SKU} (${data.ItemName||''})\nTotal: R${data.Total.toFixed(2)}\n\nRegards,\nWykies Automation`;
  if(data.Email){ MailApp.sendEmail({to:data.Email, subject, body, attachments:[pdfBlob]}); }
  if(admin){ MailApp.sendEmail({to:admin, subject:'[Admin Copy] '+subject, body, attachments:[pdfBlob]}); }
}

// ===== ITN (PayFast) =====
function handleITN(e){
  const params = e.postData && e.postData.contents ? e.postData.contents : '';
  const data = params.split('&').reduce((acc,p)=>{ const [k,v] = p.split('='); acc[decodeURIComponent(k)] = decodeURIComponent((v||'').replace(/\+/g,' ')); return acc; }, {});

  const passphrase = SP.getProperty('PAYFAST_PASSPHRASE')||'';
  const merchantId = SP.getProperty('MERCHANT_ID');
  if(data.merchant_id !== merchantId){ return _cors({ok:false}); }

  const calcSig = pfSignature(data, passphrase);
  if(data.signature !== calcSig){ return _cors({ok:false}); }

  const env = (SP.getProperty('ENV')||'live').toLowerCase();
  const validateUrl = env==='live' ? 'https://api.payfast.co.za/eng/query/validate' : 'https://sandbox.payfast.co.za/eng/query/validate';
  const vres = UrlFetchApp.fetch(validateUrl, {method:'post', payload: params});
  if(String(vres.getContentText()).trim().toLowerCase()!=='valid'){ return _cors({ok:false}); }

  const sku = data.item_description;
  const amountGross = parseFloat(data.amount_gross||data.amount||'0');
  const p = listProducts().find(x=> String(x.sku)===String(sku));
  if(!p) return _cors({ok:false});
  const expected = Number(p.price||0);
  if(Math.abs(expected - amountGross) > 0.01){ return _cors({ok:false}); }

  if((data.payment_status||'').toLowerCase()==='complete'){
    const inv = nextInvoiceNo();
    const vatRate = 0.15;
    const total = amountGross; const net = total / (1+vatRate); const vat = total - net;
    const invData = { InvoiceNo: inv, OrderID: data.m_payment_id||'', Email: data.email_address||'', SKU: sku, ItemName: data.item_name||sku, Total: total, Net: net, VAT: vat };
    const pdf = generateInvoicePDF(invData);
    emailInvoice(invData, pdf.pdfBlob);
    const sh = _getSheet(SHEETS.PAYMENTS);
    const head = sh.getLastRow()? sh.getRange(1,1,1, sh.getLastColumn()).getValues()[0] : ['Timestamp','InvoiceNo','OrderID','pf_payment_id','Email','SKU','TotalInclVAT','ReleasedAt'];
    if(sh.getLastRow()===0) sh.appendRow(head);
    const row = [new Date(), inv, data.m_payment_id||'', data.pf_payment_id||'', data.email_address||'', sku, total, new Date()];
    sh.appendRow(row);
  }
  return _cors({ok:true});
}

function pfSignature(data, passphrase){
  const pairs = Object.keys(data).filter(k=>k!=='signature').sort().map(k=> `${encodeURIComponent(k)}=${encodeURIComponent(String(data[k]).replace(/%20/g,'+'))}`);
  if(passphrase){ pairs.push('passphrase='+encodeURIComponent(passphrase)); }
  const str = pairs.join('&');
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_512, str);
  return raw.map(b=>('0'+(b&0xff).toString(16)).slice(-2)).join('');
}

function resendInvoice(b){
  const invoiceNo = b.invoiceNo;
  const sh = _getSheet(SHEETS.PAYMENTS);
  const vals = sh.getDataRange().getValues();
  const head = vals.shift();
  const idx = Object.fromEntries(head.map((h,i)=>[h,i]));
  for(const r of vals){
    if(String(r[idx['InvoiceNo']])===String(invoiceNo)){
      const total = Number(r[idx['TotalInclVAT']]);
      const vatRate = 0.15; const net = total/(1+vatRate); const vat = total-net;
      const invData = { InvoiceNo: invoiceNo, OrderID: r[idx['OrderID']], Email: r[idx['Email']], SKU: r[idx['SKU']], ItemName: r[idx['SKU']], Total: total, Net: net, VAT: vat };
      const pdf = generateInvoicePDF(invData);
      emailInvoice(invData, pdf.pdfBlob);
      return {ok:true};
    }
  }
  return {ok:false, error:'Not found'};
}

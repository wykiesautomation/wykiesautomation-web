/**
 * Google Apps Script Web App backend for Wykies Automation
 * Publish > Deploy as web app > Execute as: Me; Who has access: Anyone with link
 * Store secrets (PayFast passphrase, Merchant Key) in PropertiesService
 */

const SHEET_ID = '12qRMe6pAPVaQtosZBnhVtpMwyNks7W8uY9PX1mF620k';
const SHEETS = { products:'Products', gallery:'Gallery', payments:'Payments', price:'PriceChanges', logs:'Logs' };

function doGet(e){
  const route = (e.parameter.route||'').toLowerCase();
  const out = ContentService.createTextOutput();
  out.setMimeType(ContentService.MimeType.JSON);
  try{
    switch(route){
      case 'products': out.setContent(JSON.stringify(getProducts())); break;
      case 'gallery': out.setContent(JSON.stringify(getGallery())); break;
      case 'payments': out.setContent(JSON.stringify(getPayments())); break;
      case 'logs': out.setContent(JSON.stringify(getLogs())); break;
      default: out.setContent(JSON.stringify({ ok:true, routes:['products','gallery','payments','logs','resendInvoice','createCheckout'] }));
    }
  }catch(err){ out.setContent(JSON.stringify({ error: err.message })); }
  addCors(out);
  return out;
}

function doPost(e){
  const route = (e.parameter.route||'').toLowerCase();
  const payload = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
  const out = ContentService.createTextOutput();
  out.setMimeType(ContentService.MimeType.JSON);
  try{
    if (route === 'resendinvoice'){
      const msg = resendInvoice(payload.pf_payment_id);
      out.setContent(JSON.stringify({ ok:true, message: msg }));
    } else if (route === 'createcheckout'){
      const form = createPayFastForm(payload);
      out.setContent(JSON.stringify({ ok:true, form }));
    } else {
      out.setContent(JSON.stringify({ error:'Unknown route' }));
    }
  }catch(err){ out.setContent(JSON.stringify({ error: err.message })); }
  addCors(out);
  return out;
}

function addCors(out){
  out.setHeader('Access-Control-Allow-Origin','*');
  out.setHeader('Access-Control-Allow-Headers','Content-Type');
}

function getProducts(){
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.products);
  const rows = sh.getDataRange().getValues();
  const [header, ...data] = rows;
  const idx = Object.fromEntries(header.map((h,i)=>[h, i]));
  return data.filter(r=>r[idx['sku']]).map(r=>({
    sku: r[idx['sku']],
    name: r[idx['name']],
    price: r[idx['price']],
    summary: r[idx['summary']],
    description: r[idx['description']],
    imageUrl: r[idx['imageUrl']],
    trialUrl: r[idx['trialUrl']],
    docUrl: r[idx['docUrl']],
    active: r[idx['active']]
  }));
}

function getGallery(){
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.gallery);
  const rows = sh.getDataRange().getValues();
  const [header, ...data] = rows;
  const idx = Object.fromEntries(header.map((h,i)=>[h, i]));
  return data.filter(r=>r[idx['imageUrl']]).map(r=>({ url: r[idx['imageUrl']], caption: r[idx['caption']] }));
}

function getPayments(){
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.payments);
  const rows = sh.getDataRange().getValues();
  const [header, ...data] = rows;
  const idx = Object.fromEntries(header.map((h,i)=>[h, i]));
  return data.filter(r=>r[idx['pf_payment_id']]).map(r=>({
    timestamp: r[idx['Timestamp']],
    invoiceNo: r[idx['InvoiceNo']],
    pf_payment_id: r[idx['pf_payment_id']],
    email: r[idx['Email']],
    sku: r[idx['SKU']],
    totalInclVAT: r[idx['TotalInclVAT']],
    releasedAt: r[idx['ReleasedAt']],
  }));
}

function getLogs(){
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.logs);
  const rows = sh.getDataRange().getValues();
  return rows.map(r=>r[0]).filter(Boolean);
}

function resendInvoice(pf_payment_id){
  if (!pf_payment_id) throw new Error('pf_payment_id required');
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.payments);
  const rows = sh.getDataRange().getValues();
  const hdr = rows.shift();
  const idx = Object.fromEntries(hdr.map((h,i)=>[h, i]));
  const found = rows.find(r=> String(r[idx['pf_payment_id']]) === String(pf_payment_id));
  if (!found) throw new Error('Payment not found');
  const email = found[idx['Email']];
  const invoiceNo = found[idx['InvoiceNo']];
  GmailApp.sendEmail(email + ',wykiesautomation@gmail.com', 'Invoice ' + invoiceNo, 'Attached is your invoice.');
  return 'Invoice email queued for ' + email;
}

function createPayFastForm(payload){
  const props = PropertiesService.getScriptProperties();
  const merchant_id = props.getProperty('PAYFAST_MERCHANT_ID');
  const merchant_key = props.getProperty('PAYFAST_MERCHANT_KEY');
  const passphrase = props.getProperty('PAYFAST_PASSPHRASE');

  const { amount, item_name, item_description, m_payment_id, return_url, cancel_url, notify_url, email_address } = payload;
  if (!amount || !item_name || !m_payment_id) throw new Error('Missing required fields');
  const fields = {
    merchant_id, merchant_key, return_url, cancel_url, notify_url,
    amount: Number(amount).toFixed(2),
    item_name, item_description, m_payment_id, email_address
  };
  const sig = sign(fields, passphrase);
  return { action: 'https://www.payfast.co.za/eng/process', method: 'post', fields: { ...fields, signature: sig } };
}

function sign(fields, passphrase){
  const query = Object.keys(fields)
    .filter(k=> fields[k] !== undefined && fields[k] !== null && fields[k] !== '')
    .sort()
    .map(k=> `${encodeURIComponent(k)}=${encodeURIComponent(String(fields[k]).trim().replace(/%20/g,'+'))}`)
    .join('&');
  const full = passphrase ? query + `&passphrase=${encodeURIComponent(passphrase.trim().replace(/%20/g,'+'))}` : query;
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, full);
  return raw.map(b=> ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

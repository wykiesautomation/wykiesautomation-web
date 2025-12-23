// Wykies Automation Apps Script backend (Google Sheets CMS + PayFast)

/** CONFIG via Script Properties */
const SP = PropertiesService.getScriptProperties();
const SHEET_ID = SP.getProperty('SHEET_ID');
const ADMIN_PASSPHRASE = SP.getProperty('ADMIN_PASSPHRASE');
const ADMIN_TOKEN_SECRET = SP.getProperty('ADMIN_TOKEN_SECRET');
const ADMIN_EMAIL = SP.getProperty('ADMIN_EMAIL') || 'wykiesautomation@gmail.com';
const PAYFAST_PASSPHRASE = SP.getProperty('PAYFAST_PASSPHRASE');
const MERCHANT_ID = SP.getProperty('PAYFAST_MERCHANT_ID');
const MERCHANT_KEY = SP.getProperty('PAYFAST_MERCHANT_KEY');
const IS_SANDBOX = (SP.getProperty('PAYFAST_SANDBOX')||'false') === 'true';

const S_PRODUCTS = 'Products';
const S_GALLERY  = 'Gallery';
const S_ORDERS   = 'Orders';

function _sheet(name){ return SpreadsheetApp.openById(SHEET_ID).getSheetByName(name); }
function _rows(sheet){ const v = sheet.getDataRange().getValues(); const head=v.shift(); return v.filter(r=>r.join('').length).map(r=>Object.fromEntries(head.map((h,i)=>[String(h||'').trim().toLowerCase(), r[i]]))); }
function _upsertRow(sheet, keyField, keyValue, obj){
  const rng = sheet.getDataRange(); const v = rng.getValues(); const head=v[0].map(h=>String(h||'').trim().toLowerCase());
  const idx = v.findIndex((row,i)=> i>0 && String(row[head.indexOf(keyField)]).toUpperCase()===String(keyValue).toUpperCase());
  const arr = head.map(h=> obj[h]!==undefined? obj[h]: (idx>0? v[idx][head.indexOf(h)] : ''));
  if(idx>0){ sheet.getRange(idx+1,1,1,arr.length).setValues([arr]); }
  else{ sheet.appendRow(arr); }
}

function _json(data, status){
  const out = ContentService.createTextOutput(JSON.stringify(data));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

function _authed(e){
  const token = (e?.parameter?.token) || (e?.postData ? (JSON.parse(e.postData.contents||'{}').token||'') : '') || e?.headers?.['X-Auth'] || e?.headers?.['x-auth'];
  if(!token) throw new Error('NO_TOKEN');
  const parts = token.split('.');
  if(parts.length!==3) throw new Error('BAD_TOKEN');
  const [h,p,s] = parts; const payload = JSON.parse(Utilities.newBlob(Utilities.base64Decode(p)).getDataAsString());
  const sig = Utilities.computeHmacSha256Signature([h,p].join('.'), ADMIN_TOKEN_SECRET);
  const sigB64 = Utilities.base64Encode(sig).replace(/=+$/,'');
  if(sigB64!==s) throw new Error('SIG_MISMATCH');
  if(payload.exp < Date.now()) throw new Error('TOKEN_EXPIRED');
  return payload;
}

function _mintToken(){
  const header = Utilities.base64EncodeWebSafe(JSON.stringify({alg:'HS256',typ:'JWT'})).replace(/=+$/,'');
  const payload = Utilities.base64EncodeWebSafe(JSON.stringify({role:'admin', exp: Date.now()+ 8*60*60*1000})).replace(/=+$/,'');
  const sig = Utilities.computeHmacSha256Signature([header,payload].join('.'), ADMIN_TOKEN_SECRET);
  const sigB64 = Utilities.base64EncodeWebSafe(sig).replace(/=+$/,'');
  return [header,payload,sigB64].join('.');
}

function doGet(e){
  try{
    const route = (e.parameter.route||'').toLowerCase();
    if(route==='products'){
      const rows = _rows(_sheet(S_PRODUCTS));
      return _json(rows.map(r=>({
        sku: r.sku, name: r.name, price: r.price, image: r.image, trial: r.trial, description: r.description, enabled: String(r.enabled||'true')
      })));
    }
    if(route==='gallery'){
      const rows = _rows(_sheet(S_GALLERY));
      return _json(rows.map(r=>({url:r.url, title:r.title, sku:r.sku})));
    }
    if(route==='admin/ping'){
      _authed({headers:e});
      return _json({ok:true});
    }
    return _json({ok:true, msg:'Wykies Automation API'});
  }catch(err){
    return _json({error:String(err)});
  }
}

function doPost(e){
  const route = (e.parameter.route||'').toLowerCase();
  let body = {};
  try{ body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {}; }catch(_){ body={}; }
  try{
    if(route==='admin/login'){
      const pass = (body.passphrase||'').trim();
      if(!pass || pass!==ADMIN_PASSPHRASE) throw new Error('AUTH_FAIL');
      return _json({ token: _mintToken() });
    }
    if(route==='admin/updateproduct'){
      _authed(e);
      const { sku, name, price, image, trial, enabled } = body;
      if(!sku) throw new Error('SKU_REQUIRED');
      _upsertRow(_sheet(S_PRODUCTS), 'sku', sku, { sku, name, price, image, trial, enabled });
      return _json({ok:true});
    }
    if(route==='admin/addgallery'){
      _authed(e);
      const { url, title, sku } = body; if(!url) throw new Error('URL_REQUIRED');
      const sh = _sheet(S_GALLERY); sh.appendRow([url,title,sku]);
      return _json({ok:true});
    }
    if(route==='contact/send'){
      const { name, email, phone, product, message, copy, whatsapp } = body;
      const subj = `[WykiesAutomation] ${name||'Customer'} enquiry${product?(' · '+product):''}`;
      const html = `<p><b>Name:</b> ${name||''}<br/><b>Email:</b> ${email||''}<br/><b>Phone:</b> ${phone||''}<br/><b>Product:</b> ${product||'General'}</p><p>${(message||'').replace(/
/g,'<br/>')}</p>`;
      GmailApp.sendEmail(ADMIN_EMAIL, subj, '', {htmlBody: html, replyTo: email||ADMIN_EMAIL});
      const sh = _sheet('Contacts') || SpreadsheetApp.openById(SHEET_ID).insertSheet('Contacts');
      sh.appendRow([new Date(), name, email, phone, product, message, copy, whatsapp]);
      if(copy && email){ GmailApp.sendEmail(email, 'We received your message — Wykies Automation', 'Thank you! We will reply shortly.', {htmlBody: html}); }
      return _json({ok:true});
    }
    if(route==='payments/create'){
      const { sku, buyer } = body; if(!sku) throw new Error('SKU_REQUIRED');
      const product = _rows(_sheet(S_PRODUCTS)).find(r=>String(r.sku).toUpperCase()===String(sku).toUpperCase());
      if(!product) throw new Error('PRODUCT_NOT_FOUND');
      const amount = Number(product.price);
      const pf = {
        merchant_id: MERCHANT_ID,
        merchant_key: MERCHANT_KEY,
        return_url: 'https://wykiesautomation.co.za/product.html?sku='+encodeURIComponent(sku)+'&paid=1',
        cancel_url: 'https://wykiesautomation.co.za/product.html?sku='+encodeURIComponent(sku)+'&cancel=1',
        notify_url: ScriptApp.getService().getUrl() + '?route=payfast/itn',
        name_first: (buyer&&buyer.name)||'',
        email_address: (buyer&&buyer.email)||'',
        m_payment_id: 'WA-'+sku+'-'+Date.now(),
        amount: amount.toFixed(2),
        item_name: product.name||sku,
        custom_str1: sku
      };
      const sig = _payfastSignature(pf);
      const action = IS_SANDBOX ? 'https://sandbox.payfast.co.za/eng/process' : 'https://www.payfast.co.za/eng/process';
      const html = _autoSubmitForm(action, Object.assign({}, pf, {signature: sig}));
      return _json({ html });
    }
    if(route==='payfast/itn'){
      // ITN posts are form-encoded. Build an object from e.parameter
      const p = e.parameter || {};
      const verifiedSig = _verifyPayfastSignature(p);
      if(!verifiedSig) return _json({ok:false, reason:'SIG_FAIL'});

      // Optional: server-side validate data back with PayFast (recommended)
      const validateUrl = (IS_SANDBOX?'https://sandbox.payfast.co.za':'https://www.payfast.co.za')+'/eng/query/validate';
      const resp = UrlFetchApp.fetch(validateUrl, {method:'post', muteHttpExceptions:true, payload: p});
      const bodyText = resp.getContentText().trim();
      const valid = bodyText==='VALID';

      const sku = p['custom_str1'];
      const amount = Number(p['amount_gross'] || p['amount']);
      const prod = _rows(_sheet(S_PRODUCTS)).find(r=>String(r.sku).toUpperCase()===String(sku).toUpperCase());
      const priceOk = prod && Math.abs(Number(prod.price)-amount) < 0.01;

      const status = (valid && priceOk && (p['payment_status']==='COMPLETE')) ? 'COMPLETE' : 'PENDING';

      _sheet(S_ORDERS).appendRow([new Date(), p['pf_payment_id']||'', sku, p['email_address']||'', amount, status, JSON.stringify(p)]);

      if(status==='COMPLETE'){
        try{ _emailInvoicePdf({ sku, product: prod, itn: p }); }catch(err){ Logger.log(err); }
      }
      return _json({ok:true});
    }

    return _json({error:'NO_ROUTE'});
  }catch(err){
    return _json({error:String(err)});
  }
}

function _payfastSignature(fields){
  const keys = Object.keys(fields).filter(k=>fields[k]!==undefined && fields[k]!=='' ).sort();
  const q = keys.map(k=> `${k}=${encodeURIComponent(String(fields[k]).trim().replace(/%20/g,'+'))}`).join('&');
  const str = q + (PAYFAST_PASSPHRASE? `&passphrase=${encodeURIComponent(PAYFAST_PASSPHRASE)}` : '');
  const md5 = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, str);
  return md5.map(b=> ('0'+(b&0xFF).toString(16)).slice(-2)).join('');
}

function _verifyPayfastSignature(p){
  const clone = Object.assign({}, p);
  delete clone.signature;
  const sig = _payfastSignature(clone);
  return (sig && p.signature && sig.toLowerCase()===String(p.signature).toLowerCase());
}

function _autoSubmitForm(action, fields){
  const inputs = Object.keys(fields).map(k=>`<input type="hidden" name="${k}" value="${String(fields[k]).replace(/&/g,'&amp;').replace(/"/g,'&quot;')}">`).join('
');
  return `<!doctype html><html><body><form id="f" method="post" action="${action}">${inputs}</form><script>document.getElementById('f').submit();</script></body></html>`;
}

function _emailInvoicePdf({ sku, product, itn }){
  const amount = Number(itn['amount_gross']||itn['amount']).toFixed(2);
  const buyer = { email: itn['email_address']||'', name: (itn['name_first']||'')+ ' ' + (itn['name_last']||'') };
  const tmpl = HtmlService.createTemplateFromFile('invoice_template');
  tmpl.data = { now: new Date(), sku, product, itn, amount };
  const html = tmpl.evaluate().getContent();
  const blob = Utilities.newBlob(html, 'text/html', 'invoice.html');
  const pdf = blob.getAs('application/pdf');
  const subject = `Invoice: ${product.name} (${sku})`;
  const msg = `Thank you for your purchase. Your payment is confirmed. Invoice attached.

Regards
Wykies Automation`;
  GmailApp.sendEmail(buyer.email || ADMIN_EMAIL, subject, msg, {attachments:[pdf], htmlBody: msg});
  if(buyer.email) GmailApp.sendEmail(ADMIN_EMAIL, `[Copy] ${subject}`, msg, {attachments:[pdf]});
}

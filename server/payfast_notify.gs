
function payfastITN(e){
  const ip = e && e.postData ? e.postData.getDataAsString() : '';
  // IP validation (simplified); use X-Forwarded-For if behind proxy
  const source = e && e.parameter && e.parameter['source_ip'] ? e.parameter['source_ip'] : '';
  if(!validPayFastIP(source)) return json({ ok:false, message:'Invalid IP' });

  const params = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
  // If PayFast posts form-encoded, parse accordingly
  if(!params.pf_payment_id){
    const raw = e.postData.getDataAsString();
    raw.split('&').forEach(pair=>{ const [k,v] = pair.split('='); params[k]=decodeURIComponent(v||''); });
  }

  const sig = params['signature']; delete params['signature'];
  const expect = md5Signature(params);
  if(sig !== expect) return json({ ok:false, message:'Bad signature' });

  const sku = params['custom_str1'];
  const amount = Number(params['amount']);
  const products = readRows(getSheet(CONFIG.PRODUCTS_SHEET)).items;
  const p = products.find(x=> String(x.sku)===String(sku));
  if(!p || Math.abs(Number(p.price) - amount) > 0.01) return json({ ok:false, message:'Amount mismatch' });

  const invoiceNo = nextInvoiceNumber();
  const email = params['email_address'] || params['email'] || '';
  const paymentsSheet = getSheet(CONFIG.PAYMENTS_SHEET);
  const { headers } = readRows(paymentsSheet);
  if(headers.length===0) paymentsSheet.appendRow(['Timestamp','InvoiceNo','OrderID','pf_payment_id','Email','SKU','TotalInclVAT','ReleasedAt']);
  paymentsSheet.appendRow([new Date(), invoiceNo, params['m_payment_id']||'', params['pf_payment_id']||'', email, sku, amount, new Date()]);

  const pdf = buildInvoicePDF({ invoiceNo, email, product:p, amount });
  const subject = `Tax Invoice ${invoiceNo} — ${p.name}`;
  const body = `Thank you for your purchase. Your invoice is attached.

Download Links:
Trial: ${p.trialUrl||'#'}
Documentation: ${p.docUrl||'#'}`;
  MailApp.sendEmail({ to: email, cc: CONFIG.ADMIN_EMAIL, subject, body, attachments: [pdf] });

  return json({ ok:true, message:'Released', invoiceNo });
}

function resendInvoice(invoiceNo){
  // finds payment row and re-sends invoice
  const sh = getSheet(CONFIG.PAYMENTS_SHEET);
  const { headers, items } = readRows(sh);
  const it = items.find(x=> String(x.InvoiceNo)===String(invoiceNo));
  if(!it) return { ok:false, message:'Not found' };
  const products = readRows(getSheet(CONFIG.PRODUCTS_SHEET)).items;
  const p = products.find(x=> String(x.sku)===String(it.SKU));
  const pdf = buildInvoicePDF({ invoiceNo, email: it.Email, product:p, amount: it.TotalInclVAT });
  const subject = `Tax Invoice ${invoiceNo} — ${p.name}`;
  const body = `Re-sent invoice attached.`;
  MailApp.sendEmail({ to: it.Email, cc: CONFIG.ADMIN_EMAIL, subject, body, attachments: [pdf] });
  return { ok:true, message:'Invoice re-sent' };
}

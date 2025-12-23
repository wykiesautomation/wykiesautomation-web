
function doGet(e){
  const ep = e.parameter.endpoint || '';
  if(ep === 'products'){
    const { items } = readRows(getSheet(CONFIG.PRODUCTS_SHEET));
    return json({ items: items.filter(x=> String(x.active||'TRUE').toUpperCase() !== 'FALSE') });
  }
  if(ep === 'gallery'){
    const { items } = readRows(getSheet(CONFIG.GALLERY_SHEET));
    return json({ items });
  }
  if(ep === 'payments'){
    const { items } = readRows(getSheet(CONFIG.PAYMENTS_SHEET));
    return json({ items });
  }
  return json({ ok:false, message:'Unknown endpoint' });
}

function doPost(e){
  const ep = e.parameter.endpoint || '';
  const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
  if(ep === 'adminLogin'){
    const ok = body.passphrase === CONFIG.ADMIN_PASSPHRASE;
    return json({ ok, message: ok? 'Welcome' : 'Denied' });
  }
  if(ep === 'updateProduct'){
    const sheet = getSheet(CONFIG.PRODUCTS_SHEET);
    const data = {
      sku: body.sku,
      name: body.name,
      price: Number(body.price),
      summary: body.summary,
      description: body.description,
      imageUrl: body.imageUrl,
      trialUrl: body.trialUrl,
      docUrl: body.docUrl,
      active: 'TRUE'
    };
    upsertRow(sheet, 'sku', body.sku, data);
    return json({ ok:true, message:'Product saved' });
  }
  if(ep === 'addGallery'){
    const sheet = getSheet(CONFIG.GALLERY_SHEET);
    const { headers } = readRows(sheet);
    if(headers.length===0) sheet.appendRow(['url','caption','addedAt']);
    sheet.appendRow([body.url, body.caption||'', new Date()]);
    return json({ ok:true, message:'Gallery item added' });
  }
  if(ep === 'contact'){
    const subject = `Enquiry: ${body.sku||''}`;
    const html = `Name: ${body.name}<br>Email: ${body.email}<br>Phone: ${body.phone}<br>Product: ${body.sku}<br><br>${body.message||''}`;
    MailApp.sendEmail({ to: CONFIG.ADMIN_EMAIL, subject, htmlBody: html });
    if(body.copyMe){ MailApp.sendEmail({ to: body.email, subject: 'Copy — '+subject, htmlBody: html }); }
    return json({ ok:true, message:'Email sent' });
  }
  if(ep === 'createPayment'){
    const products = readRows(getSheet(CONFIG.PRODUCTS_SHEET)).items;
    const p = products.find(x=> String(x.sku)===String(body.sku));
    const amount = Number(body.amount || (p && p.price));
    const item_name = body.item_name || (p && p.name);
    const payload = {
      merchant_id: CONFIG.PF_MERCHANT_ID,
      merchant_key: CONFIG.PF_MERCHANT_KEY,
      return_url: e.parameter.return_url || e.parameter.returnUrl || 'https://wykiesautomation.co.za/thanks.html',
      cancel_url: 'https://wykiesautomation.co.za/cancel.html',
      notify_url: (PropertiesService.getScriptProperties().getProperty('WEBAPP_URL') || e.parameter.webapp_url || '') + '?endpoint=payfastITN',
      amount: amount.toFixed(2),
      item_name: item_name,
      custom_str1: p.sku,
    };
    payload.signature = md5Signature(payload);
    return json({ ok:true, action:'https://www.payfast.co.za/eng/process', form: payload });
  }
  if(ep === 'resendInvoice'){
    return json(resendInvoice(body.invoiceNo));
  }
  if(ep === 'payfastITN'){
    return payfastITN(e);
  }
  return json({ ok:false, message:'Unknown endpoint' });
}

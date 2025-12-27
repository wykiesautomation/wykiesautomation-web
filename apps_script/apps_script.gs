function doGet(e){
  const path = (e.parameter.path||'').toLowerCase();
  const sheet = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
  const out = {};
  if(path==='products') out.list = sheet.getSheetByName('Products').getDataRange().getValues();
  if(path==='gallery') out.list = sheet.getSheetByName('Gallery').getDataRange().getValues();
  if(path==='payments') out.list = sheet.getSheetByName('Payments').getDataRange().getValues();
  if(path==='pricechanges') out.list = sheet.getSheetByName('PriceChanges').getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify(normalize(path, out.list||[]))).setMimeType(ContentService.MimeType.JSON);
}
function normalize(path, rows){
  if(rows.length<2) return [];
  const headers = rows[0];
  return rows.slice(1).map(r=>{ const o={}; headers.forEach((h,i)=> o[String(h).trim()] = r[i]); if(path==='products'){ o.imageFile = (o.sku||'').toLowerCase()+'.png'; } return o; });
}
function doPost(e){
  const data = JSON.parse(e.postData.contents||'{}');
  if(data.action==='itn'){
    const log = data.data||{};
    const sheet = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
    sheet.getSheetByName('Payments').appendRow([new Date(), `INV-${Date.now()}`, log.orderId, log.pf_payment_id, log.email, log.itemName, log.amount, new Date()]);
    const pdfBlob = HtmlService.createHtmlOutput(makeInvoiceHtml(log)).getBlob().getAs('application/pdf').setName(`INV-${Date.now()}.pdf`);
    GmailApp.sendEmail(log.email, 'Your Wykies Automation Tax Invoice', 'Please find your invoice attached.', {attachments:[pdfBlob]});
    GmailApp.sendEmail(PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL'), '[Admin Copy] Invoice', 'Admin copy attached.', {attachments:[pdfBlob]});
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({ok:false}));
}
function makeInvoiceHtml(log){
  const vat = Math.round(parseFloat(log.amount||'0') * 0.15 * 100)/100;
  const total = Math.round(parseFloat(log.amount||'0') * 100)/100;
  const net = Math.round((total - vat) * 100)/100;
  const logo = PropertiesService.getScriptProperties().getProperty('LOGO_URL');
  return `<!doctype html><html><body style="font-family:Arial">
  <img src="${logo}" style="height:40px"/>
  <h1>Tax Invoice</h1>
  <p><strong>Invoice No:</strong> INV-${Date.now()}</p>
  <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
  <table border="1" cellpadding="6" cellspacing="0">
    <tr><th>SKU</th><th>Description</th><th>Net</th><th>VAT (15%)</th><th>Total</th></tr>
    <tr><td>${log.itemName}</td><td>${log.itemName} purchase</td><td>R${net}</td><td>R${vat}</td><td>R${total}</td></tr>
  </table>
  <p>Supplier: Wykies Automation • Email: wykiesautomation@gmail.com</p>
  </body></html>`;
}

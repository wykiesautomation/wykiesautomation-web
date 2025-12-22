
function doGet(e){
  var ss = SpreadsheetApp.getActive();
  var type = (e && e.parameter && e.parameter.type) || 'products';
  if (type === 'products'){
    var sh = ss.getSheetByName('Products');
    var data = sh ? sh.getDataRange().getValues().slice(1) : [];
    var products = data.map(function(r){ return {sku:r[0], name:r[1], price:r[2], amount:r[3], image:r[4], description:r[5]}; });
    return ContentService.createTextOutput(JSON.stringify({products:products}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  if (type === 'gallery'){
    var gh = ss.getSheetByName('Gallery');
    var g = gh ? gh.getDataRange().getValues().slice(1) : [];
    var gallery = g.map(function(r){ return {date:r[0], url:r[1], title:r[2]}; });
    return ContentService.createTextOutput(JSON.stringify({gallery:gallery}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({ok:false}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e){
  var payload = {};
  try { payload = JSON.parse(e.postData.contents); } catch(err){}
  if (payload.type === 'products') return saveProducts_(payload.data);
  if (payload.type === 'gallery') return addGallery_(payload.url, payload.title);
  if (payload.type === 'itn') return handleITN_(payload.data);
  if (payload.type === 'contact') return handleContact_(payload.data);
  return ContentService.createTextOutput(JSON.stringify({ok:false})).setMimeType(ContentService.MimeType.JSON);
}

function saveProducts_(list){
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName('Products') || ss.insertSheet('Products');
  sh.clear(); sh.appendRow(['SKU','Name','Price','Amount','Image','Description']);
  list.forEach(function(p){ sh.appendRow([p.sku,p.name,p.price,p.amount,p.image,p.description||'']); });
  return ContentService.createTextOutput(JSON.stringify({ok:true}))
    .setMimeType(ContentService.MimeType.JSON);
}

function addGallery_(url, title){
  var ss = SpreadsheetApp.getActive();
  var gh = ss.getSheetByName('Gallery') || ss.insertSheet('Gallery');
  if (gh.getLastRow() === 0) gh.appendRow(['Date','URL','Title']);
  gh.appendRow([new Date(), url, title || '']);
  return ContentService.createTextOutput(JSON.stringify({ok:true}))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleContact_(d){
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName('Contacts') || ss.insertSheet('Contacts');
  if (sh.getLastRow() === 0) sh.appendRow(['Date','Name','Email','Phone','Product','Message']);
  sh.appendRow([new Date(), d.name, d.email, d.phone, d.product, d.message]);
  var admin = 'wykiesautomation@gmail.com';
  var subj = 'WykiesAutomation Contact — ' + (d.product || 'General');
  var html = '<p><b>Name:</b> '+d.name+'<br><b>Email:</b> '+d.email+'<br><b>Phone:</b> '+(d.phone||'')+'<br><b>Product:</b> '+(d.product||'')+'</p>'+
             '<p>'+ (d.message||'') +'</p>';
  GmailApp.sendEmail(admin, subj, 'See details', {htmlBody: html});
  if (d.copy && d.email){ GmailApp.sendEmail(d.email, 'We received your message', 'Thank you — we will be in touch shortly.', {htmlBody:'<p>Thanks for contacting Wykies Automation.</p>'+html}); }
  return ContentService.createTextOutput(JSON.stringify({ok:true}))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleITN_(d){
  var ss = SpreadsheetApp.getActive();
  var invSh = ss.getSheetByName('Invoices') || ss.insertSheet('Invoices');
  if (invSh.getLastRow() === 0) invSh.appendRow(['Date','Invoice #','SKU','Amount','First','Last','Email','PF Payment ID','Status']);
  var invNum = 'INV-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMddHHmmss');
  invSh.appendRow([new Date(), invNum, d.sku, d.amount, d.name_first, d.name_last, d.email_address, d.pf_payment_id, d.payment_status]);
  var pdfBlob = createInvoicePdf_(invNum, d);
  var admin = d.admin_email || 'wykiesautomation@gmail.com';
  var subject = 'Invoice ' + invNum + ' — ' + d.sku;
  var html = '<p>Thank you for your purchase.</p>' +
             '<p><b>Invoice:</b> ' + invNum + '</p>' +
             '<p><b>SKU:</b> ' + d.sku + ' · <b>Amount:</b> R' + Number(d.amount).toFixed(2) + '</p>';
  if (d.email_address){ GmailApp.sendEmail(d.email_address, subject, 'See attached invoice.', {htmlBody: html, attachments:[pdfBlob]}); }
  GmailApp.sendEmail(admin, subject, 'Customer invoice attached.', {htmlBody: html, attachments:[pdfBlob]});
  return ContentService.createTextOutput(JSON.stringify({ok:true, invoice:invNum}))
    .setMimeType(ContentService.MimeType.JSON);
}

function createInvoicePdf_(invNum, d){
  var doc = DocumentApp.create('Invoice '+invNum);
  var body = doc.getBody();
  body.appendParagraph('Wykies Automation').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph('Invoice '+invNum);
  body.appendParagraph('Date: '+Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'));
  body.appendParagraph('Customer: '+ (d.name_first||'') +' '+ (d.name_last||''));
  body.appendParagraph('Email: '+ (d.email_address||''));
  body.appendParagraph('Phone: '+ (d.cell_number||''));
  body.appendParagraph('');
  var table = body.appendTable([
    ['SKU','Description','Amount (ZAR)'],
    [d.sku, d.sku+' — '+(d.item_name||'Product'), Number(d.amount).toFixed(2)]
  ]);
  table.getRow(0).editAsText().setBold(true);
  body.appendParagraph('');
  body.appendParagraph('Payment reference: '+(d.pf_payment_id||''));
  body.appendParagraph('Payment status: '+(d.payment_status||''));
  doc.saveAndClose();
  var pdf = DriveApp.getFileById(doc.getId()).getAs('application/pdf').setName('Invoice_'+invNum+'.pdf');
  return pdf;
}

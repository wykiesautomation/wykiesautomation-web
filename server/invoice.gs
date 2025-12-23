
function buildInvoicePDF({ invoiceNo, email, product, amount }){
  const folder = ensureInvoiceFolder();
  const doc = DocumentApp.create(`Invoice ${invoiceNo}`);
  const body = doc.getBody();
  body.appendParagraph('TAX INVOICE').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(`Invoice No: ${invoiceNo}`);
  body.appendParagraph(`Date: ${formatDate(new Date())}`);
  body.appendParagraph('Supplier: Wykies Automation');
  body.appendParagraph('Recipient: ' + email);
  body.appendParagraph('');
  body.appendParagraph(`Product: ${product.sku} — ${product.name}`);
  body.appendParagraph(`Amount (incl. VAT): R ${Number(amount).toFixed(2)}`);
  body.appendParagraph(`VAT Rate: ${(CONFIG.VAT_RATE*100).toFixed(0)}%`);
  doc.saveAndClose();
  const file = DriveApp.getFileById(doc.getId());
  const pdf = file.getAs('application/pdf');
  const saved = folder.createFile(pdf).setName(`${invoiceNo}.pdf`);
  return saved.getBlob();
}

function ensureInvoiceFolder(){
  const year = new Date().getFullYear();
  const parent = DriveApp.getFoldersByName('Invoices').hasNext() ? DriveApp.getFoldersByName('Invoices').next() : DriveApp.createFolder('Invoices');
  const subIter = parent.getFoldersByName(String(year));
  const sub = subIter.hasNext() ? subIter.next() : parent.createFolder(String(year));
  return sub;
}

function formatDate(d){
  return Utilities.formatDate(d, Session.getScriptTimeZone() || 'Africa/Johannesburg', 'yyyy-MM-dd');
}

/** Apps Script — API + PayFast ITN (do not expose passphrase client-side) */
function doGet(e){
  const act = (e.parameter.action||'').toLowerCase();
  if(act==='products') return json(getProducts_());
  return json([]);
}
function doPost(e){
  // Handle ITN: validate signature, amount, and (optionally) source IP if proxied by Worker
  const params = e.parameter;
  // TODO: validation
  // TODO: generate invoice PDF and email customer + admin
  return json({ok:true});
}
function getProducts_(){
  const sh = SpreadsheetApp.openById('PUT_SHEET_ID').getSheetByName('Products');
  const rows = sh.getDataRange().getValues();
  const hdr = rows.shift();
  const list = rows.filter(r=>r[0]).map(r=>({sku:r[0], name:r[1], price:r[2], summary:r[3], description:r[4], imageUrl:r[5], trialUrl:r[6], docUrl:r[7], active:r[8]}));
  return list;
}
function json(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

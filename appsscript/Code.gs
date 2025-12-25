
/** Apps Script Web App: Products API + ITN Handler **/

function doGet(e){
  const sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  const products = getProducts(sheetId);
  return ContentService.createTextOutput(JSON.stringify({products})).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e){
  // ITN handler: validate signature, amount, etc. Then log and invoice
  const params = e.postData ? e.postData.contents : '';
  // TODO: Implement PayFast signature validation and verification
  // Logger.log(params);
  return ContentService.createTextOutput('OK');
}

function getProducts(sheetId){
  const ss = SpreadsheetApp.openById(sheetId);
  const sh = ss.getSheetByName('Products');
  if (!sh) return [];
  const rows = sh.getDataRange().getValues();
  const headers = rows.shift();
  const idx = (name)=> headers.indexOf(name);
  return rows.map(r=>({
    id: r[idx('id')],
    name: r[idx('name')],
    summary: r[idx('summary')],
    description: r[idx('description')],
    price: r[idx('price')],
    image: r[idx('image')]
  }));
}

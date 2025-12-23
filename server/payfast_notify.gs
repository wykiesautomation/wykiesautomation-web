/** PayFast ITN handler (simplified) */
function doPost(e){
  const params = e.parameter;
  // TODO: validate signature with passphrase and merchant key
  const ss = getSs_();
  const pay = ss.getSheetByName('Payments');
  const headers = ['Timestamp','InvoiceNo','OrderID','pf_payment_id','Email','SKU','TotalInclVAT','ReleasedAt'];
  if(pay.getLastRow()===0){ pay.appendRow(headers); }
  pay.appendRow([new Date(), params['m_payment_id']||'', params['m_payment_id']||'', params['pf_payment_id']||'', params['email_address']||'', params['item_name']||'', params['amount_gross']||'', new Date()]);
  return ContentService.createTextOutput('OK');
}

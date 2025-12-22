/**
 * Wykies Automation — PayFast ITN handler (signature + PDF invoice + email)
 * Deploy as Web App (Execute as: Me, Access: Anyone/Anyone with link)
 */
const CONFIG = {
  SHEET_ID: 'YOUR_GOOGLE_SHEET_ID',
  TEMPLATE_DOC_ID: 'YOUR_DOC_TEMPLATE_ID',
  INVOICE_FOLDER_ID: 'YOUR_INVOICE_FOLDER_ID',
  ADMIN_EMAIL: 'wykiesautomation@gmail.com',
  SECURITY_PASSPHRASE: '',
  COMPANY_NAME: 'Wykies Automation',
  COMPANY_VAT: 'VAT No. (optional)',
};
function parseFormEncoded(raw){return raw.split('&').reduce((a,kv)=>{const [k,v]=kv.split('=');a[decodeURIComponent(k)]=decodeURIComponent((v||'').replace(/\+/g,' '));return a;},{});} 
function encodeForSignature(val){const enc=encodeURIComponent(String(val)).replace(/%20/g,'+');return enc.replace(/%[0-9a-f]{2}/g,m=>m.toUpperCase());}
function buildSignatureString(params, passphrase){
  const ORDER=['merchant_id','merchant_key','return_url','cancel_url','notify_url','name_first','name_last','email_address','cell_number','m_payment_id','amount','item_name','item_description','custom_int1','custom_int2','custom_int3','custom_int4','custom_int5','custom_str1','custom_str2','custom_str3','custom_str4','custom_str5','email_confirmation','confirmation_address','payment_method','subscription_type','billing_date','recurring_amount','frequency','cycles'];
  const filtered={}; Object.keys(params).forEach(k=>{ if(k==='signature') return; const v=params[k]; if(v!==undefined && v!==null && String(v).trim()!==''){ filtered[k]=String(v).trim(); } });
  const present=Object.keys(filtered);
  const ordered=[...ORDER.filter(k=>present.includes(k)), ...present.filter(k=>!ORDER.includes(k)).sort((a,b)=>a.localeCompare(b))];
  const parts=ordered.map(k=>`${k}=${encodeForSignature(filtered[k])}`);
  if(passphrase && passphrase.trim()!==''){ parts.push(`passphrase=${encodeForSignature(passphrase.trim())}`); }
  return parts.join('&');
}
function md5LowerHex(text){ const raw=Utilities.computeDigest(Utilities.DigestAlgorithm.MD5,text); return raw.map(b=>(b+256)%256).map(n=>n.toString(16).padStart(2,'0')).join(''); }
function createInvoicePdf(payload){ const f=DriveApp.getFileById(CONFIG.TEMPLATE_DOC_ID); const dest=DriveApp.getFolderById(CONFIG.INVOICE_FOLDER_ID); const copy=f.makeCopy(dest); const doc=DocumentApp.openById(copy.getId()); const body=doc.getBody(); const today=Utilities.formatDate(new Date(), Session.getScriptTimeZone(),'yyyy-MM-dd'); const reps=new Map([
  ['{{COMPANY}}',CONFIG.COMPANY_NAME],['{{VAT}}',CONFIG.COMPANY_VAT],['{{DATE}}',today],
  ['{{ITEM}}',payload.item_name||'Item'],['{{AMOUNT}}',payload.amount_gross||payload.amount||'0.00'],
  ['{{FIRST}}',payload.name_first||''],['{{LAST}}',payload.name_last||''],['{{EMAIL}}',payload.email_address||''],
  ['{{PF_REF}}',payload.pf_payment_id||''],['{{OUR_REF}}',payload.m_payment_id||''],['{{STATUS}}',payload.payment_status||'']
]); reps.forEach((v,k)=>body.replaceText(k,String(v))); doc.saveAndClose(); const pdfBlob=copy.getAs(MimeType.PDF); const name=`Invoice_${payload.m_payment_id||'REF'}_${today}.pdf`; const pdf=dest.createFile(pdfBlob).setName(name); copy.setTrashed(true); return pdf.getBlob(); }
function doPost(e){ try{ const type=(e.postData&&e.postData.type)||''; const raw=(e.postData&&e.postData.contents)||''; const payload= type.includes('application/json') ? JSON.parse(raw||'{}') : parseFormEncoded(raw);
  const sigStr=buildSignatureString(payload, CONFIG.SECURITY_PASSPHRASE); const localSig=md5LowerHex(sigStr); const remoteSig=(payload.signature||'').toLowerCase(); const signatureOk=(localSig===remoteSig);
  const amount=Number(payload.amount_gross||payload.amount||0); const amountOk=(!Number.isNaN(amount) && amount>0);
  logToSheet(payload, signatureOk, amountOk);
  if((payload.payment_status||'').toUpperCase()==='COMPLETE' && signatureOk && amountOk){ const pdf=createInvoicePdf(payload); sendEmails(payload,pdf); }
  return ContentService.createTextOutput(JSON.stringify({ok:true, signatureOk, amountOk})).setMimeType(ContentService.MimeType.JSON);
 } catch(err){ return ContentService.createTextOutput(JSON.stringify({ok:false,error:err.message})).setMimeType(ContentService.MimeType.JSON); } }
function logToSheet(payload, signatureOk, amountOk){ const sh=SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName('Orders')||SpreadsheetApp.openById(CONFIG.SHEET_ID).insertSheet('Orders'); sh.appendRow([ new Date(), payload.m_payment_id||'', payload.pf_payment_id||'', payload.item_name||'', payload.amount_gross||payload.amount||'', `${payload.name_first||''} ${payload.name_last||''}`.trim(), payload.email_address||'', payload.payment_status||'', signatureOk?'OK':'BAD', amountOk?'OK':'BAD' ]); }
function sendEmails(payload,pdfBlob){ const admin=CONFIG.ADMIN_EMAIL; const recip=(payload.email_address||'').trim(); const subject=`Invoice — ${payload.item_name||''} — ${payload.m_payment_id||''}`; const body=`${CONFIG.COMPANY_NAME}\n\nThank you for your payment.\n\nStatus: ${payload.payment_status}\nItem: ${payload.item_name}\nAmount: ${payload.amount_gross||payload.amount}\nCustomer: ${payload.name_first} ${payload.name_last} <${payload.email_address}>\nPayFast Ref: ${payload.pf_payment_id}\nOur Ref: ${payload.m_payment_id}\n\nInvoice PDF is attached.`; if(recip){ GmailApp.sendEmail(recip, subject, body, {attachments:[pdfBlob]}); } GmailApp.sendEmail(admin, subject, body, {attachments:[pdfBlob]}); }
function doGet(e){ return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON); }

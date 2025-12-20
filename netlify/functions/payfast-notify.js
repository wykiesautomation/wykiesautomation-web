const crypto = require('crypto');
const EXPECTED_AMOUNTS = { 'WA-01':'3499.00','WA-02':'3499.00','WA-03':'4999.00','WA-04':'1499.00','WA-05':'1999.00','WA-06':'3999.00','WA-07':'2999.00','WA-08':'1999.00' };
const PF_PASSPHRASE = process.env.PF_PASSPHRASE || '';
const IS_SANDBOX = (process.env.IS_SANDBOX || 'false') === 'true';
const PF_VALIDATE_URL = IS_SANDBOX ? 'https://sandbox.payfast.co.za/eng/query/validate' : 'https://www.payfast.co.za/eng/query/validate';
const ENABLE_IP_CHECK = (process.env.PF_CHECK_SOURCE_IP || 'false') === 'true';
const ALLOWED_IPS = (process.env.PF_ALLOWED_IPS || '').split(',').map(s=>s.trim()).filter(Boolean);
function md5(str){ return crypto.createHash('md5').update(str,'utf8').digest('hex'); }
function buildSignature(params){
  const keys = Array.from(params.keys()).filter(k=>k!=='signature' && params.get(k)!==null && params.get(k)!=='').sort((a,b)=>a.localeCompare(b));
  let s = keys.map(k=>`${k}=${encodeURIComponent(params.get(k)).replace(/%20/g,'+')}`).join('&');
  if(PF_PASSPHRASE){ s += `&passphrase=${encodeURIComponent(PF_PASSPHRASE).replace(/%20/g,'+')}`; }
  return md5(s);
}
async function confirmWithServer(raw){
  try{ const res = await fetch(PF_VALIDATE_URL,{ method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: raw }); const text = await res.text(); return text.trim()==='VALID'; }
  catch(e){ return false; }
}
exports.handler = async (event)=>{
  try{
    if(event.httpMethod!=='POST') return { statusCode:405, body:'Method Not Allowed' };
    const sourceIp = event.headers['x-forwarded-for']?.split(',')[0]?.trim() || event.headers['client-ip'] || event.ip || '';
    const ipValid = !ENABLE_IP_CHECK || (ALLOWED_IPS.length===0) || ALLOWED_IPS.includes(sourceIp);
    const rawBody = event.isBase64Encoded ? Buffer.from(event.body||'', 'base64').toString('utf8') : (event.body||'');
    const params = new URLSearchParams(rawBody);
    const postedSignature = params.get('signature') || '';
    const computedSignature = buildSignature(params);
    const signatureValid = postedSignature === computedSignature;
    const m_payment_id = params.get('m_payment_id') || '';
    const payment_status = params.get('payment_status') || '';
    const amount_gross = params.get('amount_gross') || params.get('amount') || '';
    const expected = EXPECTED_AMOUNTS[m_payment_id];
    const amountValid = expected ? Math.abs(parseFloat(expected) - parseFloat(amount_gross||'0')) <= 0.01 : true;
    const serverValid = await confirmWithServer(rawBody);
    const ok = signatureValid && amountValid && ipValid && (payment_status==='COMPLETE') && serverValid;
    return { statusCode:200, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ok, payment_status, m_payment_id, amount_gross, signatureValid, amountValid, ipValid, serverValid, sourceIp }) };
  }catch(err){ return { statusCode:200, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ok:false, error:String(err) }) } }
};

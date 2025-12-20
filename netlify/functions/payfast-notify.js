// netlify/functions/payfast-notify.js (CommonJS)
const crypto = require('crypto');

const EXPECTED_AMOUNTS = {
  'WA-01': '3499.00',
  'WA-02': '3499.00',
  'WA-03': '4999.00',
  'WA-04': '1499.00',
  'WA-05': '1999.00',
  'WA-06': '3999.00',
  'WA-07': '2999.00',
  'WA-08': '1999.00'
};

const PF_PASSPHRASE = process.env.PF_PASSPHRASE || '';
const IS_SANDBOX = (process.env.IS_SANDBOX || 'false') === 'true';
const PF_VALIDATE_URL = IS_SANDBOX ? 'https://sandbox.payfast.co.za/eng/query/validate' : 'https://www.payfast.co.za/eng/query/validate';

function md5(str){ return crypto.createHash('md5').update(str, 'utf8').digest('hex'); }
function buildSignatureFromBody(rawBody){
  const params = new URLSearchParams(rawBody);
  let paramString = '';
  for (const [k,v] of params){
    if (k === 'signature') break;
    paramString += `${k}=${encodeURIComponent(v)}&`;
  }
  if (paramString.endsWith('&')) paramString = paramString.slice(0,-1);
  const withPass = PF_PASSPHRASE ? `${paramString}&passphrase=${encodeURIComponent(PF_PASSPHRASE)}` : paramString;
  return md5(withPass);
}
async function confirmWithServer(rawBody){
  const res = await fetch(PF_VALIDATE_URL, { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: rawBody });
  const text = await res.text();
  return text.trim() === 'VALID';
}
exports.handler = async (event) => {
  try{
    if (event.httpMethod !== 'POST') return { statusCode:405, body:'Method Not Allowed' };
    const rawBody = event.isBase64Encoded ? Buffer.from(event.body,'base64').toString('utf8') : (event.body || '');
    const params = new URLSearchParams(rawBody);
    const postedSignature = params.get('signature') || '';
    const computedSignature = buildSignatureFromBody(rawBody);
    const signatureValid = postedSignature === computedSignature;
    const m_payment_id = params.get('m_payment_id') || '';
    const amount_gross = params.get('amount_gross') || params.get('amount') || '';
    const expected = EXPECTED_AMOUNTS[m_payment_id];
    const amountValid = expected ? Math.abs(float(expected) - float(amount_gross)) <= 0.01 : true;
    const serverValid = await confirmWithServer(rawBody);
    const payment_status = params.get('payment_status') || '';
    const ok = signatureValid && amountValid && serverValid && (payment_status === 'COMPLETE');
    return { statusCode:200, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ok, signatureValid, amountValid, serverValid, payment_status, m_payment_id, amount_gross }) };
  }catch(err){
    return { statusCode:200, body: JSON.stringify({ ok:false, error:String(err) }) };
  }
};

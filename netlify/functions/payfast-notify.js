
// netlify/functions/payfast-notify.js
// Handle PayFast ITN (Instant Transaction Notification)
// Docs: https://developers.payfast.co.za/documentation/ (ITN validation & query/validate)
// Note: notify_url is server-to-server; customers are not redirected here.
// Ref: https://stackoverflow.com/questions/51889825/payfast-not-redirecting-to-notify-url

import crypto from 'crypto';

const EXPECTED_AMOUNTS = {
  'WA-01': '3499.00', // 3D Printer GUI
  'WA-02': '3499.00', // Plasma Cutter GUI
  'WA-03': '4999.00', // Van Wyk ECU/TCU Dashboard
  'WA-04': '1499.00', // IoT Freezer Control
  'WA-05': '1999.00', // Nano GSM Gate Controller
  'WA-06': '3999.00', // SEMS
  'WA-07': '2999.00', // Hybrid Gate Controller
  'WA-08': '1999.00'  // Battery Charger GUI
};

const PF_PASSPHRASE = process.env.PF_PASSPHRASE || '';
const PF_MERCHANT_ID = process.env.PF_MERCHANT_ID || '';
const GAS_WEBHOOK_URL = process.env.GAS_WEBHOOK_URL || '';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'wykiesautomation@gmail.com';
const IS_SANDBOX = (process.env.IS_SANDBOX || 'true') === 'true';

const PF_VALIDATE_URL = IS_SANDBOX
  ? 'https://sandbox.payfast.co.za/eng/query/validate'
  : 'https://www.payfast.co.za/eng/query/validate';

// Helpers
function md5(str){
  return crypto.createHash('md5').update(str).digest('hex');
}

function buildSignatureFromBody(rawBody){
  // Preserve original field order using URLSearchParams iteration
  const params = new URLSearchParams(rawBody);
  let paramString = '';
  for (const [k,v] of params){
    if (k === 'signature') break; // PayFast posts signature last
    paramString += `${k}=${encodeURIComponent(v)}&`;
  }
  if (paramString.endsWith('&')) paramString = paramString.slice(0,-1);
  const withPass = PF_PASSPHRASE ? `${paramString}&passphrase=${encodeURIComponent(PF_PASSPHRASE)}` : paramString;
  return md5(withPass);
}

async function confirmWithServer(rawBody){
  const res = await fetch(PF_VALIDATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: rawBody
  });
  const text = await res.text();
  return text.trim() === 'VALID';
}

async function notifyGoogle(payload){
  if (!GAS_WEBHOOK_URL) return { ok: true, skipped: true };
  try{
    const r = await fetch(GAS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return { ok: r.ok, status: r.status };
  }catch(err){
    return { ok:false, error: String(err) };
  }
}

async function emailAdmin(subject, text){
  if (!SENDGRID_API_KEY) return { ok:true, skipped:true };
  try{
    const r = await fetch('https://api.sendgrid.com/v3/mail/send',{
      method:'POST',
      headers:{
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type':'application/json'
      },
      body: JSON.stringify({
        personalizations:[{ to:[{email: ADMIN_EMAIL}] }],
        from:{ email:'no-reply@wykiesautomation.co.za', name:'Wykies Automation' },
        subject, content:[{ type:'text/plain', value:text }]
      })
    });
    return { ok:r.ok, status:r.status };
  }catch(err){
    return { ok:false, error:String(err) };
  }
}

export default async (event, context) => {
  try{
    if (event.httpMethod !== 'POST'){
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Handle possible base64 encoding
    const rawBody = event.isBase64Encoded ? Buffer.from(event.body,'base64').toString('utf8') : event.body || '';
    const params = new URLSearchParams(rawBody);

    // Basic 200 early response is recommended in docs, but Netlify requires a single response —
    // so we validate quickly and then return 200 with details.

    // 1) Signature check
    const postedSignature = params.get('signature') || '';
    const computedSignature = buildSignatureFromBody(rawBody);
    const signatureValid = postedSignature === computedSignature;

    // 2) Payment data check (amount matches your catalog)
    const m_payment_id = params.get('m_payment_id') || '';
    const amount_gross = params.get('amount_gross') || params.get('amount') || '';
    const expected = EXPECTED_AMOUNTS[m_payment_id];
    const amountValid = expected ? Math.abs(parseFloat(expected) - parseFloat(amount_gross)) <= 0.01 : true; // allow if unknown id

    // 3) Server confirmation (PayFast validate)
    const serverValid = await confirmWithServer(rawBody);

    const payment_status = params.get('payment_status') || '';
    const pf_payment_id = params.get('pf_payment_id') || '';
    const item_name = params.get('item_name') || '';
    const email = params.get('email_address') || '';

    const ok = signatureValid && amountValid && serverValid && (payment_status === 'COMPLETE');

    const summary = {
      ok,
      signatureValid,
      amountValid,
      serverValid,
      payment_status,
      pf_payment_id,
      m_payment_id,
      amount_gross,
      item_name,
      email
    };

    // Notify Google Apps Script (logging + email)
    await notifyGoogle({ source:'payfast-itn', sandbox:IS_SANDBOX, ...summary, raw: Object.fromEntries(params) });

    // Optional admin email via SendGrid
    const subject = ok ? `PAID: ${item_name} (${m_payment_id})` : `PAYMENT ALERT: ${item_name} (${m_payment_id})`;
    const text = `Status: ${payment_status}\nOK: ${ok}\nSignature: ${signatureValid}\nAmount: ${amount_gross} (expected ${expected || 'n/a'})\nServerValid: ${serverValid}\nPF ID: ${pf_payment_id}\nM ID: ${m_payment_id}`;
    await emailAdmin(subject, text);

    // Always 200 so PayFast doesn't retry; we log outcome above
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(summary)
    };
  }catch(err){
    // Still return 200 to stop retries but log error details
    return { statusCode: 200, body: JSON.stringify({ ok:false, error: String(err) }) };
  }
};

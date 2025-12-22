
import crypto from 'node:crypto';

function toAmount(n){ return Number(n).toFixed(2); }
function encode(val){ return encodeURIComponent(val).replace(/%20/g,'+'); }
function generateSignature(fields, passphrase){
  const data = Object.entries(fields).filter(([k,v])=> k!=='signature' && v!==undefined && v!==null && String(v).length>0);
  data.sort((a,b)=> a[0].localeCompare(b[0]));
  const paramString = data.map(([k,v])=> `${k}=${encode(String(v))}`).join('&') + (passphrase? `&passphrase=${encode(passphrase)}`:'');
  return crypto.createHash('md5').update(paramString,'utf8').digest('hex');
}

export default async (req, context) => {
  try{
    const body = await req.json();
    const sku = body.sku;
    const host = req.headers.get('host');
    const base = `https://${host}`;

    const IS_SANDBOX = process.env.IS_SANDBOX === 'true';
    const action = IS_SANDBOX ? 'https://sandbox.payfast.co.za/eng/process' : 'https://www.payfast.co.za/eng/process';
    const merchant_id = process.env.PF_MERCHANT_ID;
    const merchant_key = process.env.PF_MERCHANT_KEY;
    const passphrase = process.env.PF_PASSPHRASE || '';

    const prodsResp = await fetch(`${base}/data/products.json`);
    const PRODUCTS = await prodsResp.json();
    const p = PRODUCTS.find(x=>x.sku===sku);
    if(!p){ return Response.json({error:'Unknown SKU'}, {status:400}); }

    const fields = {
      merchant_id,
      merchant_key,
      return_url: `${base}/thank-you.html`,
      cancel_url: `${base}/cancel.html`,
      notify_url: `${base}/.netlify/functions/payfast-notify`,
      name_first: body.name_first || '',
      name_last: body.name_last || '',
      email_address: body.email_address || '',
      cell_number: body.cell_number || '',
      m_payment_id: `${sku}-${Date.now()}`,
      amount: toAmount(p.amount),
      item_name: p.name,
      item_description: `${sku} — ${p.name}`,
      custom_str1: sku,
    };

    const signature = generateSignature(fields, passphrase);
    fields.signature = signature;

    return Response.json({action, fields});
  }catch(err){
    return Response.json({error: err.message}, {status:500});
  }
}

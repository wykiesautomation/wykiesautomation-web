
import crypto from 'node:crypto';

function encode(val){ return encodeURIComponent(val).replace(/%20/g,'+'); }
function verifySignature(payload, passphrase){
  const data = Object.entries(payload).filter(([k,v])=> k!=='signature' && v!==undefined && v!==null && String(v).length>0);
  data.sort((a,b)=> a[0].localeCompare(b[0]));
  const paramString = data.map(([k,v])=> `${k}=${encode(String(v))}`).join('&') + (passphrase? `&passphrase=${encode(passphrase)}`:'');
  const calc = crypto.createHash('md5').update(paramString,'utf8').digest('hex');
  return (calc === String(payload.signature).toLowerCase());
}

function toAmount(n){ return Number(n).toFixed(2); }

export default async (req, context) => {
  try{
    const text = await req.text();
    const pairs = new URLSearchParams(text);
    const payload = {}; for (const [k,v] of pairs.entries()) payload[k]=v;

    const passphrase = process.env.PF_PASSPHRASE || '';
    const okSig = verifySignature(payload, passphrase);

    const host = req.headers.get('host');
    const base = `https://${host}`;
    const prodsResp = await fetch(`${base}/data/products.json`);
    const PRODUCTS = await prodsResp.json();
    const sku = payload.custom_str1 || 'UNKNOWN';
    const p = PRODUCTS.find(x=>x.sku===sku);

    const amountMatches = !!p && toAmount(p.amount) === toAmount(payload.amount);
    const statusComplete = String(payload.payment_status).toUpperCase() === 'COMPLETE';

    const verified = okSig && amountMatches && statusComplete;

    if (verified){
      const appsUrl = process.env.APPS_SCRIPT_URL;
      const adminEmail = process.env.ADMIN_EMAIL || 'wykiesautomation@gmail.com';
      const out = await fetch(appsUrl, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ type:'itn', data: {
          sku,
          amount: payload.amount,
          name_first: payload.name_first || '',
          name_last: payload.name_last || '',
          email_address: payload.email_address || '',
          cell_number: payload.cell_number || '',
          pf_payment_id: payload.pf_payment_id,
          payment_status: payload.payment_status,
          m_payment_id: payload.m_payment_id,
          admin_email: adminEmail
        }})
      });
      return new Response(out.ok? 'OK':'FAIL', {status: out.ok?200:500});
    } else {
      return new Response('INVALID', {status: 400});
    }
  }catch(err){
    return new Response('ERROR:'+err.message, {status:500});
  }
}

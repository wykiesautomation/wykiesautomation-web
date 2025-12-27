export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const srcIp = request.headers.get('CF-Connecting-IP') || '';
    const body = await request.text();
    const params = new URLSearchParams(body);
    function buildSignature(p){
      const keys = Array.from(p.keys()).sort();
      const pairs = [];
      for(const k of keys){
        const v = p.get(k); if(!v) continue;
        pairs.push(`${k}=${encodeURIComponent(v).replace(/%20/g,'+')}`);
      }
      if (env.PASS_PHRASE) pairs.push(`passphrase=${encodeURIComponent(env.PASS_PHRASE).replace(/%20/g,'+')}`);
      return pairs.join('&');
    }
    const sigString = buildSignature(params);
    const dig = await crypto.subtle.digest('MD5', new TextEncoder().encode(sigString));
    const signature = Array.from(new Uint8Array(dig)).map(b=>b.toString(16).padStart(2,'0')).join('');
    const receivedSig = (params.get('signature')||'').toLowerCase();
    if(signature !== receivedSig) return new Response('Invalid signature', { status: 400 });
    if(params.get('merchant_id') !== env.MERCHANT_ID) return new Response('Bad merchant', { status: 400 });
    const log = { ts:new Date().toISOString(), srcIp, pf_payment_id:params.get('pf_payment_id'), amount:params.get('amount'), email:params.get('email_address'), orderId:params.get('m_payment_id'), itemName:params.get('item_name') };
    await fetch('https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ action:'itn', data: log })});
    return new Response('OK', { status: 200 });
  }
}
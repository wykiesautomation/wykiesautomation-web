// Cloudflare Worker — PayFast ITN forwarder with IP allowlist (do not store secrets here)
// Configure allowed IPs via KV/Env; validate source and forward to Apps Script
export default {
  async fetch(request, env){
    if(request.method!=='POST') return new Response('OK');
    // TODO: Resolve PayFast IPs periodically and compare against CF-Connecting-IP
    const url = new URL(request.url);
    const target = env.APPSCRIPT_URL; // set via wrangler secret
    if(!target) return new Response('Missing target', {status:500});
    return fetch(target, {method:'POST', headers:{'content-type':'application/x-www-form-urlencoded'}, body: await request.text()});
  }
}

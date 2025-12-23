
// payfast-notify.js — Optional Cloudflare Worker to forward ITN to Apps Script
export default {
  async fetch(request, env){
    if(request.method!=='POST') return new Response('Method Not Allowed', {status:405});
    const url = new URL(request.url);
    if(url.pathname!=='/itn') return new Response('Not Found', {status:404});
    const body = await request.text();
    const target = env.APPS_SCRIPT_ITN_URL; // e.g. https://script.google.com/.../exec?action=itn
    const res = await fetch(target, { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body });
    return new Response(await res.text(), {status: res.status});
  }
}


// payfast-itn-worker.js — Cloudflare Worker to validate source IP and forward ITN to Apps Script
export default {
  async fetch(request, env, ctx) {
    // Allow only specific paths
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/payfast-itn')) {
      return new Response('Not Found', { status: 404 });
    }

    // Validate source IP ranges (sample CIDRs — keep updated from PayFast notices)
    const ip = request.headers.get('CF-Connecting-IP') || '';
    const allowedCidrs = [
      '197.97.145.144/28', '41.74.179.192/27', '102.216.36.0/28', '102.216.36.128/28',
      '34.107.176.71/32', '34.120.184.229/32', '144.126.193.139/32'
    ];
    // Simple check: exact matches for specific IPs + CIDR utility (basic)
    function ipToLong(ip){ return ip.split('.').reduce((acc,v)=> (acc<<8)+(+v), 0) }
    function cidrContains(cidr, ip){
      const [block, bits] = cidr.split('/');
      const mask = -1 << (32 - Number(bits));
      return (ipToLong(block) & mask) === (ipToLong(ip) & mask);
    }
    const ok = allowedCidrs.some(c => c.endsWith('/32') ? ip === c.split('/')[0] : cidrContains(c, ip));
    if (!ok) {
      return new Response('Bad source IP address', { status: 403 });
    }

    // Forward payload to Apps Script ITN endpoint
    const appsUrl = env.APPSCRIPT_URL; // set as secret
    const body = await request.text();
    const fwd = await fetch(appsUrl + '?action=payfast_itn', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body
    });
    const text = await fwd.text();
    return new Response(text, { status: fwd.status });
  }
};

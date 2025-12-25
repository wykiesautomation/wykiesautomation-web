
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/payfast-itn') {
      return new Response('Not found', { status: 404 });
    }
    // Validate source IP (replace with official PayFast IP list)
    const src = request.headers.get('CF-Connecting-IP') || '';
    const ALLOWED = (env.PAYFAST_IPS || '').split(',').map(x => x.trim()).filter(Boolean);
    if (ALLOWED.length && !ALLOWED.includes(src)) {
      return new Response('Forbidden', { status: 403 });
    }
    // Forward ITN payload to Apps Script
    const body = await request.text();
    const r = await fetch(env.APPSCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    const text = await r.text();
    return new Response(text, { status: r.status });
  }
};

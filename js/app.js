
// Global config loader
(async () => {
  const res = await fetch('/config.json');
  const cfg = await res.json();
  window.WA_CONFIG = cfg;
})();

// Fetch products (CMS first; fallback to config)
window.fetchProducts = async function () {
  try {
    const base = window.WA_CONFIG.cms.appsScriptBase;
    const url = base ? base + window.WA_CONFIG.cms.endpoints.products : null;
    if (url) {
      const r = await fetch(url);
      if (r.ok) {
        const data = await r.json();
        return data.products || [];
      }
    }
  } catch (e) { console.warn('CMS fetch failed, using fallback', e); }
  return window.WA_CONFIG.fallbackProducts || [];
}

window.fetchProduct = async function (sku) {
  const list = await window.fetchProducts();
  return list.find(p => p.sku === sku) || { sku, name: sku, price: 0 };
}

window.submitForm = async function (endpoint, payload) {
  try {
    const base = window.WA_CONFIG.cms.appsScriptBase;
    const url = base ? base + endpoint : null;
    if (!url) throw new Error('Apps Script URL not configured');
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return r.ok;
  } catch (e) { console.error(e); return false; }
}

window.renderPayFastForm = function (product) {
  const cfg = window.WA_CONFIG.payfast;
  const notify = cfg.notify_url;
  const returnUrl = location.origin + '/thank-you.html';
  const cancelUrl = location.origin + '/cancelled.html';
  const form = `
    <form action="${cfg.process_url_live}" method="post">
      <input type="hidden" name="merchant_id" value="${cfg.merchant_id}">
      <input type="hidden" name="merchant_key" value="${cfg.merchant_key}">
      <input type="hidden" name="amount" value="${Number(product.price).toFixed(2)}">
      <input type="hidden" name="item_name" value="${product.name}">
      <input type="hidden" name="item_description" value="${product.sku}">
      <input type="hidden" name="return_url" value="${returnUrl}">
      <input type="hidden" name="cancel_url" value="${cancelUrl}">
      <input type="hidden" name="notify_url" value="${notify}">
      <button class="btn" type="submit">Pay with PayFast</button>
    </form>`;
  return form;
}

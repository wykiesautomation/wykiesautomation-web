
const { SHEET_API_URL } = window.__env || {};
const PRODUCTS_ENDPOINT = (SHEET_API_URL || '/cms') + '/products';
function getParam(name){ const u = new URL(location.href); return u.searchParams.get(name); }
async function init(){
  const sku = getParam('sku');
  const res = await fetch(PRODUCTS_ENDPOINT);
  const products = await res.json();
  const p = products.find(x=>x.sku===sku) || products[0];
  const el = document.getElementById('product-detail');
  el.innerHTML = `
    <h1>${p.name}</h1>
    <img src="${p.image}" alt="${p.name}" />
    <p class="price">${p.price}</p>
    <p>${p.description||''}</p>
    <div class="row">
      <form method="post" action="https://www.payfast.co.za/eng/process" target="_blank" class="inline">
        <input type="hidden" name="merchant_id" value="" />
        <input type="hidden" name="merchant_key" value="" />
        <input type="hidden" name="return_url" value="${location.origin}/success.html" />
        <input type="hidden" name="cancel_url" value="${location.origin}/cancel.html" />
        <input type="hidden" name="notify_url" value="${location.origin}/.netlify/functions/payfast-notify" />
        <input type="hidden" name="amount" value="${(p.price||'').replace(/[^\d.]/g,'')}" />
        <input type="hidden" name="item_name" value="${p.name}" />
        <input type="hidden" name="item_description" value="${p.description || ''}" />
        <input type="hidden" name="custom_str1" value="${p.sku}" />
        <button type="submit">Checkout</button>
      </form>
      ${p.trial_url ? `<a href="${p.trial_url}" class="btn" target="_blank">Free Trial</a>` : ''}
    </div>`;
}
document.addEventListener('DOMContentLoaded', ()=>init().catch(console.error));

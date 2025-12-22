
// Public site JS: load products, handle contact, WhatsApp link
const { SHEET_API_URL, ADMIN_PASSPHRASE, WHATSAPP_NUMBER_INTL } = window.__env || {};
const PRODUCTS_ENDPOINT = (SHEET_API_URL || '/cms') + '/products';
const CONTACT_ENDPOINT = (SHEET_API_URL || '/cms') + '/contact';

async function loadProducts() {
  const res = await fetch(PRODUCTS_ENDPOINT);
  const products = await res.json();
  const grid = document.getElementById('products');
  const select = document.getElementById('product-select');
  grid.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p class="price">${p.price}</p>
      <p>${p.description || ''}</p>
      <div class="row">
        <a href="product.html?sku=${encodeURIComponent(p.sku)}" class="btn">View</a>
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
    grid.appendChild(card);
    const opt = document.createElement('option');
    opt.value = p.sku; opt.textContent = `${p.sku} — ${p.name}`;
    select.appendChild(opt);
  });
}

async function submitContact(evt){
  evt.preventDefault();
  const form = evt.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const res = await fetch(CONTACT_ENDPOINT, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)});
  const ok = res.ok;
  alert(ok ? 'Message sent.' : 'Failed to send, please try again.');
}

function setupWhatsApp(){
  const number = WHATSAPP_NUMBER_INTL || '27716816131';
  const link = `https://wa.me/${number}?text=${encodeURIComponent('Hi Wykies Automation, I would like assistance with a product.')}`;
  document.getElementById('whatsapp-link').href = link;
  document.getElementById('whatsapp-footer').href = link;
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts().catch(console.error);
  document.getElementById('contact-form').addEventListener('submit', submitContact);
  setupWhatsApp();
});

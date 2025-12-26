
/** Wykies Automation – public JS (products + PayFast) */
const API_BASE = 'YOUR_APPS_SCRIPT_WEB_APP_URL'; // e.g., https://script.google.com/macros/s/XXXX/exec
const WHATSAPP_NUMBER = '27716816131'; // E.164 without + for wa.me

const qs = (sel, el=document) => el.querySelector(sel);
const qsa = (sel, el=document) => [...el.querySelectorAll(sel)];
const fmtRand = () => Math.random().toString(36).slice(2);
const fmtZAR = v => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(v);

async function fetchJSON(url) {
  const r = await fetch(url, { credentials:'omit', cache:'no-store' });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

/** Load all active products for index tiles */
async function loadProducts() {
  const el = qs('#product-grid');
  if (!el) return;
  el.innerHTML = '<div class="card">Loading products…</div>';
  try {
    const data = await fetchJSON(`${API_BASE}?op=products&_=${fmtRand()}`);
    // data = [{ sku,name,price,summary,description,imageUrl,trialUrl,docUrl,active }, ...]
    el.innerHTML = '';
    data.filter(p => String(p.active).toUpperCase() === 'TRUE').forEach(p => {
      const imgSrc = (p.imageUrl && p.imageUrl.trim()) ? p.imageUrl.trim() : `assets/img/wa-${p.sku.split('-')[1]}.png`;
      const tile = document.createElement('div');
      tile.className = 'card';
      tile.innerHTML = `
        <img class="product-img" src="${imgSrc}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="badge">${p.sku}</p>
        <p>${p.summary ?? ''}</p>
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <span class="price">${fmtZAR(p.price)}</span>
          <a class="btn btn-primary" href="product.html?sku=${encodeURIComponent(p.sku)}">View</a>
        </div>
      `;
      el.appendChild(tile);
    });
  } catch (err) {
    el.innerHTML = `<div class="card">Failed to load products. Please retry.</div>`;
    console.error(err);
  }
}

/** Load single product detail (from ?sku=) */
async function loadProductDetail() {
  const el = qs('#product-detail');
  if (!el) return;
  const params = new URLSearchParams(location.search);
  const sku = params.get('sku');
  if (!sku) { el.innerHTML = '<div class="card">No product selected.</div>'; return; }
  try {
    const p = await fetchJSON(`${API_BASE}?op=product&sku=${encodeURIComponent(sku)}&_=${fmtRand()}`);
    const imgSrc = (p.imageUrl && p.imageUrl.trim()) ? p.imageUrl.trim() : `assets/img/wa-${sku.split('-')[1]}.png`;
    el.innerHTML = `
      <div class="card">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <img class="product-img" src="${imgSrc}" alt="${p.name}">
          <div>
            <h2>${p.name}</h2>
            <p class="badge">${p.sku}</p>
            <p class="price">${fmtZAR(p.price)} (incl. VAT)</p>
            <p>${p.description ?? p.summary ?? ''}</p>
            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
              <button class="btn btn-primary" id="buyBtn">Buy Now</button>
              ${p.docUrl ? `<a class="btn" href="${p.docUrl}" target="_blank" rel="noopener">Docs</a>` : ''}
              ${p.trialUrl ? `<a class="btn" href="${p.trialUrl}" target="_blank" rel="noopener">Trial</a>` : ''}
              <a class="btn whatsapp" href="https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Wykies%20Automation%20-%20I%20am%20interested%20in%20${encodeURIComponent(p.sku)}" target="_blank" rel="noopener">WhatsApp</a>
              <a class="btn" href="index.html">Back</a>
            </div>
          </div>
        </div>
      </div>
      <form id="pfForm" method="post" style="display:none;"></form>
    `;
    qs('#buyBtn').addEventListener('click', () => startPayFast(p));
  } catch (err) {
    el.innerHTML = `<div class="card">Product not found.</div>`;
    console.error(err);
  }
}

/** Create signed PayFast payload via Apps Script and POST it */
async function startPayFast(p) {
  try {
    const email = ''; // Optional: add an email field to capture buyer email
    const env = 'live'; // or 'sandbox' while testing
    const data = await fetchJSON(`${API_BASE}?op=createPayment&sku=${encodeURIComponent(p.sku)}&email=${encodeURIComponent(email)}&env=${env}&_=${fmtRand()}`);
    // data = { processUrl, fields }
    const form = qs('#pfForm');
    form.action = data.processUrl;
    form.innerHTML = '';
    for (const [k, v] of Object.entries(data.fields)) {
      const input = document.createElement('input');
      input.type = 'hidden'; input.name = k; input.value = v;
      form.appendChild(input);
    }
    form.submit();
  } catch (err) {
    alert('Unable to start checkout. Please try again.');
    console.error(err);
  }
}

/** Optional: simple album filter – expects buttons with data-album and items with data-album */
function initGalleryFilter() {
  const buttons = qsa('.album-btn');
  const items = qsa('.album-item');
  if (!buttons.length || !items.length) return;
  buttons.forEach(b => {
    b.addEventListener('click', () => {
      const a = b.dataset.album;
      buttons.forEach(x => x.classList.toggle('btn-primary', x===b));
      items.forEach(it => it.style.display = (a==='all' || it.dataset.album===a) ? '' : 'none');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadProductDetail();
  initGalleryFilter();
});

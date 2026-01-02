
(function(){ document.getElementById('build-id').textContent = 'BUILD-2026-01-02-public-full'; })();

const API = (path, init={}) => fetch(`/api?path=${encodeURIComponent(path)}`, {
  ...init,
  headers: { 'content-type': 'application/json', ...(init.headers||{}) }
}).then(r => r.json()).catch(() => ({ ok:false, error:'Network error' }));

const PRICE_LIST = [
  {id:'WA-01', price:1499}, {id:'WA-02', price:2499}, {id:'WA-03', price:6499},
  {id:'WA-04', price:899}, {id:'WA-05', price:800}, {id:'WA-06', price:3999},
  {id:'WA-07', price:1800}, {id:'WA-08', price:999}, {id:'WA-09', price:1009},
  {id:'WA-10', price:1299}, {id:'WA-11', price:5499}
];

async function renderProducts(){
  const grid = document.getElementById('product-grid');
  const resp = await API('products');
  const list = resp.ok ? resp.data : PRICE_LIST.map(x => ({ id:x.id, name:x.id, price:x.price, visible:true }));
  list.filter(p=>p.visible!==false).forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img class="card-img" alt="Product image for ${p.name}" loading="lazy" src="./assets/placeholder.webp" />
      <h3>${p.name}</h3>
      <div class="badge">R ${Number(p.price).toLocaleString()}</div>
      <p class="muted">${p.desc||'Automation module'}</p>
      <div style="margin-top:8px"><a class="btn btn-outline" href="./products/product.html?id=${encodeURIComponent(p.id)}">View</a></div>
    `;
    grid.appendChild(card);
  });
  // JSON-LD
  document.getElementById('jsonld').textContent = JSON.stringify({
    '@context':'https://schema.org', '@type':'Organization',
    name:'Wykies Automation', url: 'https://wykiesautomation.co.za',
    makesOffer: list.map(p => ({ '@type':'Offer', itemOffered:{ '@type':'Product', name:p.name }, price:p.price, priceCurrency:'ZAR' }))
  });
}

async function renderPriceLog(){
  const tbody = document.querySelector('#price-log-table tbody');
  const status = document.getElementById('price-log-status');
  const resp = await API('price-log');
  if(!resp.ok){ status.textContent = 'Showing cached sample — API offline'; }
  (resp.ok ? resp.data : [
    { date:'2026-01-01', product:'WA-02', old:2499, new:2599, note:'Supplier increase' },
    { date:'2025-12-21', product:'WA-11', old:5299, new:5499, note:'Component upgrade' }
  ]).forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.date}</td><td>${row.product}</td><td>R ${row.old}</td><td>R ${row.new}</td><td>${row.note||''}</td>`;
    tbody.appendChild(tr);
  });
}

// Contact form → /api (Apps Script → Google Sheet)
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(contactForm);
  const payload = { name: fd.get('name'), email: fd.get('email'), message: fd.get('message') };
  const out = await API('contact', { method:'POST', body: JSON.stringify(payload) });
  const status = document.getElementById('contact-status');
  status.textContent = out.ok ? 'Sent — we will reply shortly.' : 'Failed to send — please try WhatsApp.';
});

// Cookie banner (POPIA)
(function(){
  const key='wa_cookie_ok';
  if(localStorage.getItem(key)) return;
  const banner = document.getElementById('cookie-banner');
  banner.hidden = false;
  document.getElementById('cookie-accept').addEventListener('click', ()=>{ localStorage.setItem(key,'1'); banner.hidden=true; });
})();

renderProducts();
renderPriceLog();

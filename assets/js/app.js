// Simple client that loads products from Apps Script or local JSON
const CONFIG_URL = 'config.json';

async function loadConfig(){
  try{ const res = await fetch(CONFIG_URL); if(res.ok) return res.json(); }catch(e){}
  // fallback to sample
  const res2 = await fetch('config.sample.json'); return res2.json();
}

async function fetchProducts(apiUrl){
  try{ const res = await fetch(apiUrl + '?action=listProducts'); if(res.ok) return res.json(); }
  catch(e){ console.warn('API failed, using local products.json', e); }
  const res2 = await fetch('data/products.json'); return res2.json();
}

function money(v){ return 'R' + Number(v).toLocaleString('en-ZA', {minimumFractionDigits:0}); }

function renderProducts(products){
  const grid = document.getElementById('productsGrid'); if(!grid) return;
  grid.innerHTML = products.filter(p=>p.active).map(p=>`
    <div class="card">
      <img src="${p.imageUrl||'assets/img/placeholder.png'}" alt="${p.name}">
      <div class="content">
        <div class="price">${money(p.price)}</div>
        <h3>${p.name}</h3>
        <p>${p.summary}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
          <a class="btn" href="product.html?sku=${encodeURIComponent(p.sku)}">View</a>
          ${p.trialUrl?`<a class="btn secondary" href="${p.trialUrl}" target="_blank">Download Trial</a>`:''}
          ${p.docUrl?`<a class="btn secondary" href="${p.docUrl}" target="_blank">Docs</a>`:''}
        </div>
      </div>
    </div>`).join('');
}

function renderProductDetail(products){
  const el = document.getElementById('productDetail'); if(!el) return;
  const params = new URLSearchParams(location.search);
  const sku = params.get('sku'); const p = products.find(x=>x.sku===sku) || products[0];
  el.innerHTML = `
    <div class="card">
      <img src="${p.imageUrl||'assets/img/placeholder.png'}" alt="${p.name}">
      <div class="content">
        <div class="price">${money(p.price)}</div>
        <h1>${p.name}</h1>
        <p>${p.description||p.summary}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
          ${p.trialUrl?`<a class="btn secondary" href="${p.trialUrl}" target="_blank">Download Trial</a>`:''}
          ${p.docUrl?`<a class="btn secondary" href="${p.docUrl}" target="_blank">Docs</a>`:''}
          <button class="btn" id="payBtn">Checkout (PayFast)</button>
        </div>
      </div>
    </div>`;
  const payBtn = document.getElementById('payBtn');
  if(payBtn){ payBtn.addEventListener('click', ()=> startPayFast(p)); }
}

function renderGallery(images){
  const grid = document.getElementById('galleryGrid'); if(!grid) return;
  grid.innerHTML = images.map(url=>`<div class="card"><img src="${url}" alt="Gallery"></div>`).join('');
}

async function init(){
  const cfg = await loadConfig();
  const products = await fetchProducts(cfg.appsScriptApiUrl);
  // fill product dropdown in contact form
  const sel = document.getElementById('productSelect');
  if(sel){ sel.innerHTML = products.map(p=>`<option value="${p.sku}">${p.sku} — ${p.name}</option>`).join(''); }
  renderProducts(products);
  renderProductDetail(products);
  // simple gallery from extracted imgs
  const gallery = [];
  for(let i=1;i<=30;i++){ const p=`assets/img/image_${i}.png`; gallery.push(p); }
  renderGallery(gallery);
  // contact form
  const form = document.getElementById('contactForm');
  if(form){ form.addEventListener('submit', async (e)=>{
    e.preventDefault(); const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries()); payload.action='contact';
    try{ const res = await fetch(cfg.appsScriptApiUrl, {method:'POST',body:JSON.stringify(payload)});
      document.getElementById('contactStatus').style.display='block';
      document.getElementById('contactStatus').textContent = res.ok? 'Sent!' : 'Failed to send';
    }catch(err){
      document.getElementById('contactStatus').style.display='block';
      document.getElementById('contactStatus').textContent = 'Failed to send';
    }
  }); }
}

window.addEventListener('DOMContentLoaded', init);

// PayFast integration stub
let PAYFAST_CFG = null;
async function startPayFast(product){
  if(!PAYFAST_CFG){ PAYFAST_CFG = await loadConfig(); }
  const f = document.createElement('form');
  f.method = 'POST';
  f.action = 'https://www.payfast.co.za/eng/process';
  const fields = {
    merchant_id: PAYFAST_CFG.payfast.merchant_id,
    merchant_key: PAYFAST_CFG.payfast.merchant_key,
    amount: product.price.toFixed(2),
    item_name: `${product.sku} ${product.name}`,
    return_url: PAYFAST_CFG.payfast.return_url,
    cancel_url: PAYFAST_CFG.payfast.cancel_url,
    notify_url: PAYFAST_CFG.payfast.notify_url,
    email_confirmation: 1,
    confirmation_address: 'wykiesautomation@gmail.com'
  };
  for(const [k,v] of Object.entries(fields)){
    const input = document.createElement('input'); input.type='hidden'; input.name=k; input.value=v; f.appendChild(input);
  }
  document.body.appendChild(f); f.submit();
}

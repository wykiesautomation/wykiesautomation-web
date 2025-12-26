
(function(){
  const cfg = window.__CONFIG__;
  const grid = document.getElementById('product-grid');
  const gal = document.getElementById('gallery-strip');
  async function fetchProducts(){
    const url = `${cfg.APPS_SCRIPT_BASE}?op=products`;
    const res = await fetch(url);
    const data = await res.json();
    return data.products || [];
  }
  function imgOrFallback(p){
    const fallback = `assets/img/${(p.sku||'wa-xx').toLowerCase()}.png`;
    return p.imageUrl && p.imageUrl.trim() ? p.imageUrl : fallback;
  }
  function makeCard(p){
    const el = document.createElement('div'); el.className='card';
    el.innerHTML = `
      <img alt='${p.name}' src='${imgOrFallback(p)}' onerror="this.src='assets/img/${(p.sku||'wa-xx').toLowerCase()}.png'">
      <div class='body'>
        <div class='sku'>${p.sku}</div>
        <h3>${p.name}</h3>
        <div class='price'>R${Number(p.price).toLocaleString()} <span class='badge'>incl. VAT</span></div>
        <p>${p.summary||''}</p>
        <div class='actions'>
          <a class='btn secondary' href='product.html?sku=${encodeURIComponent(p.sku)}'>View Details</a>
          <button class='btn' onclick='buyNow("${p.sku}")'>Buy Now</button>
          ${p.docUrl?`<a class='btn secondary' href='${p.docUrl}' target='_blank'>Docs</a>`:''}
          ${p.trialUrl?`<a class='btn secondary' href='${p.trialUrl}' target='_blank'>Trial</a>`:''}
          <a class='btn secondary' target='_blank' href='https://wa.me/27716816131?text=Hi%20about%20${encodeURIComponent(p.sku)}'>WhatsApp</a>
        </div>
      </div>`;
    return el;
  }
  async function render(){
    const products = await fetchProducts();
    products.filter(p=>String(p.active).toLowerCase()==='true').forEach(p=>grid.appendChild(makeCard(p)));
    products.slice(0,4).forEach(p=>{ const img=document.createElement('img'); img.src=imgOrFallback(p); img.alt=p.name; img.onerror=()=>img.src=`assets/img/${(p.sku||'wa-xx').toLowerCase()}.png`; gal.appendChild(img); });
  }
  window.buyNow = async function(sku){
    const email = prompt('Enter your email for the receipt:'); if(!email) return;
    const env = (window.__CONFIG__.ENV||'sandbox');
    const url = `${cfg.APPS_SCRIPT_BASE}?op=createPayment&sku=${encodeURIComponent(sku)}&email=${encodeURIComponent(email)}&env=${env}`;
    const res = await fetch(url); const data = await res.json(); if(!data||!data.processUrl){alert('Payment init failed');return;}
    const form=document.createElement('form'); form.method='POST'; form.action=data.processUrl;
    Object.keys(data.fields||{}).forEach(k=>{ const inp=document.createElement('input'); inp.type='hidden'; inp.name=k; inp.value=data.fields[k]; form.appendChild(inp); });
    document.body.appendChild(form); form.submit();
  }
  render();
})();

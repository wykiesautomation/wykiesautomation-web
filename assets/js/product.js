
(function(){
  const cfg = window.__CONFIG__;
  const params = new URLSearchParams(location.search);
  const sku = params.get('sku');
  document.getElementById('sku').textContent = sku||'';
  const mount = document.getElementById('product');
  function imgOrFallback(p){ const fallback = `assets/img/${(p.sku||'wa-xx').toLowerCase()}.png`; return p.imageUrl && p.imageUrl.trim()?p.imageUrl:fallback; }
  async function fetchProduct(){ const url = `${cfg.APPS_SCRIPT_BASE}?op=product&sku=${encodeURIComponent(sku)}`; const res = await fetch(url); const p = await res.json(); return p.product || p; }
  async function render(){
    const p = await fetchProduct(); if(!p||!p.sku){ mount.innerHTML='<p>Not found.</p>'; return; }
    mount.innerHTML = `
      <div class='row'>
        <div class='col'>
          <img class='img' src='${imgOrFallback(p)}' alt='${p.name}' onerror="this.src='assets/img/${(p.sku||'wa-xx').toLowerCase()}.png'" />
        </div>
        <div class='col'>
          <h1>${p.name} <span class='badge'>${p.sku}</span></h1>
          <div class='price'>R${Number(p.price).toLocaleString()} <span class='badge'>incl. VAT</span></div>
          <p>${p.summary||''}</p>
          <div>${p.description||''}</div>
          <div class='actions'>
            <button class='btn' onclick='buyNow("${p.sku}")'>Buy Now</button>
            ${p.docUrl?`<a class='btn secondary' href='${p.docUrl}' target='_blank'>Docs</a>`:''}
            ${p.trialUrl?`<a class='btn secondary' href='${p.trialUrl}' target='_blank'>Trial</a>`:''}
            <a class='btn secondary' target='_blank' href='https://wa.me/27716816131?text=Hi%20about%20${encodeURIComponent(p.sku)}'>WhatsApp</a>
          </div>
        </div>
      </div>`;
  }
  window.buyNow = async function(sku){
    const email = prompt('Enter your email for the receipt:'); if(!email) return;
    const env = (window.__CONFIG__.ENV||'sandbox');
    const url = `${cfg.APPS_SCRIPT_BASE}?op=createPayment&sku=${encodeURIComponent(sku)}&email=${encodeURIComponent(email)}&env=${env}`;
    const res = await fetch(url); const data = await res.json(); if(!data||!data.processUrl){ alert('Payment init failed'); return; }
    const form=document.createElement('form'); form.method='POST'; form.action=data.processUrl;
    Object.keys(data.fields||{}).forEach(k=>{ const inp=document.createElement('input'); inp.type='hidden'; inp.name=k; inp.value=data.fields[k]; form.appendChild(inp); });
    document.body.appendChild(form); form.submit();
  }
  render();
})();

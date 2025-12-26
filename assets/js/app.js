// app.js (public v7.0)
const cfgP = fetch('/config.json').then(r=>r.json());
export async function waLink(){ const cfg=await cfgP; return `https://wa.me/${cfg.whatsapp_number_international}?text=${encodeURIComponent('Hi Wykies Automation – I have a question.')}`; }
export async function money(v){ return new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(v); }

// Render homepage products
export async function renderHome(){
  const cfg=await cfgP; const res=await fetch(cfg.google.products_url); const data=await res.json();
  const el=document.getElementById('products'); if(!el) return;
  const cards = data.products.map(p=>`<div class="card"><div class="badge">${p.sku}</div><h3>${p.name}</h3><p class="price">${new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(p.price)}</p><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn" href="product.html?sku=${encodeURIComponent(p.sku)}">Details</a><button class="btn" onclick="BUY('${p.sku}')">Buy Now</button></div></div>`);
  el.innerHTML = cards.join('');
}

// Product page render
export async function renderProduct(){
  const params=new URLSearchParams(location.search); const sku=params.get('sku'); if(!sku) return;
  const cfg=await cfgP; const res=await fetch(cfg.google.products_url+`&sku=${encodeURIComponent(sku)}`); const data=await res.json(); const p=data.product;
  if(!p){ document.getElementById('name').textContent='Not found'; return; }
  document.getElementById('sku').textContent=p.sku; document.getElementById('name').textContent=p.name; document.getElementById('price').textContent=await money(p.price);
}

// BUY -> sign via Apps Script -> submit to PayFast
window.BUY = async function(sku){
  const cfg=await cfgP; const resAll=await fetch(cfg.google.products_url); const all=await resAll.json(); const p=all.products.find(x=>x.sku===sku); if(!p){alert('Not found'); return;}
  const payload={
    op:'sign',
    amount: p.price.toFixed(2),
    item_name: `${p.sku} – ${p.name}`,
    m_payment_id: `${p.sku}-${Date.now()}`,
    return_url: location.origin + '/return.html',
    cancel_url: location.origin + '/cancel.html',
    notify_url: cfg.google.apps_script_url
  };
  const signRes = await fetch(cfg.google.apps_script_url+'?op=sign&sandbox=1', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
  if(!signRes.ok){ alert('Payment init failed'); return; }
  const data=await signRes.json();
  const form=document.createElement('form'); form.method='POST'; form.action=data.process_url;
  for(const [k,v] of Object.entries({...data.fields})){
    const inp=document.createElement('input'); inp.type='hidden'; inp.name=k; inp.value=String(v); form.appendChild(inp);
  }
  document.body.appendChild(form); form.submit();
}

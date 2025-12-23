/* Client-side logic */
const cfgUrl = '../../config.json';
let CFG = null;
async function loadConfig(){ if(!CFG){ const r = await fetch(cfgUrl); CFG = await r.json(); } }
async function loadProducts(){
  await loadConfig();
  const r = await fetch(`${CFG.appsScriptWebAppUrl}?v=1&route=products`);
  const data = await r.json();
  const cont = document.querySelector('#products');
  data.products.forEach(p=>{
    const el = document.createElement('div'); el.className='card';
    el.innerHTML = `
      <img src="${p.imageUrl||'https://via.placeholder.com/480x240?text='+encodeURIComponent(p.name)}" alt="${p.name}" />
      <div class="pad">
        <h3>${p.name}</h3>
        <div class="price">R${p.price.toLocaleString('en-ZA')}</div>
        <p>${p.summary||''}</p>
        <div class="actions">
          <a href="product.html?sku=${encodeURIComponent(p.sku)}"><button>View</button></a>
          <button class="secondary" onclick="buy('${p.sku}')">Buy</button>
        </div>
      </div>`;
    cont.appendChild(el);
  });
}

async function buy(sku){
  await loadConfig();
  const email = prompt('Enter your email');
  if(!email) return;
  const r = await fetch(CFG.appsScriptWebAppUrl, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({route:'createOrder', sku, email})
  });
  const res = await r.json();
  if(res && res.payfastUrl){
    // auto-submit
    const f = document.createElement('form');
    f.method='POST'; f.action=res.payfastUrl; f.style.display='none';
    Object.entries(res.fields).forEach(([k,v])=>{
      const i=document.createElement('input'); i.name=k; i.value=v; f.appendChild(i);
    });
    document.body.appendChild(f); f.submit();
  } else {
    alert('Order creation failed: '+(res.error||'Unknown error'));
  }
}

// Product page init
(async function(){
  const u = new URL(window.location.href);
  const sku = u.searchParams.get('sku');
  if(document.querySelector('#products')){ loadProducts(); }
  if(sku){
    await loadConfig();
    const r = await fetch(`${CFG.appsScriptWebAppUrl}?v=1&route=product&sku=${encodeURIComponent(sku)}`);
    const p = await r.json();
    if(p && p.sku){
      document.getElementById('pname').textContent=p.name;
      document.getElementById('pname2').textContent=p.name;
      document.getElementById('pdesc').textContent=p.description||p.summary||'';
      document.getElementById('pprice').textContent='R'+Number(p.price).toLocaleString('en-ZA');
      document.getElementById('pimg').src=p.imageUrl||'https://via.placeholder.com/960x420?text='+encodeURIComponent(p.name);
      document.getElementById('btnTrial').onclick=()=>{ if(p.trialUrl) window.open(p.trialUrl,'_blank'); else alert('Trial not available yet'); };
      document.getElementById('btnDocs').onclick=()=>{ if(p.docUrl) window.open(p.docUrl,'_blank'); else alert('Docs not available yet'); };
      document.getElementById('btnBuy').onclick=()=> buy(sku);
    }
  }
  // gallery
  if(document.querySelector('#gallery')){
    await loadConfig();
    const r = await fetch(`${CFG.appsScriptWebAppUrl}?v=1&route=gallery`);
    const data = await r.json();
    const cont=document.querySelector('#gallery');
    data.images.forEach(g=>{
      const img=document.createElement('img'); img.src=g.imageUrl||'https://via.placeholder.com/480x240?text='+encodeURIComponent(g.sku);
      img.alt=g.sku; cont.appendChild(img);
    });
  }
})();

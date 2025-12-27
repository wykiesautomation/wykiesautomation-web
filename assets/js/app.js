(function(){
  const grid = document.getElementById('product-grid');
  const galleryGrid = document.getElementById('gallery-grid');
  const search = document.getElementById('search');
  async function loadConfig(){ const r = await fetch('config.json'); return r.json(); }
  async function loadProducts(cfg){ if(cfg.features && cfg.features.useLocalData!==false){ const r=await fetch('products.json'); return r.json(); } const r=await fetch(cfg.appsScriptUrl+'?action=products'); return r.json(); }
  function renderProducts(items){ if(!grid) return; const q=(search&&search.value||'').toLowerCase(); grid.innerHTML=items.filter(p=>!q||p.name.toLowerCase().includes(q)||p.sku.toLowerCase().includes(q)).map(p=>`<div class="card">
<img src="${p.image}" alt="${p.name}" loading="lazy"/>
<div class="pad"><div class="price-badge">R${p.price.toLocaleString('en-ZA')}</div><h3>${p.name}</h3><p>${p.summary||''}</p><div class="cta-group"><a class="btn" href="product.html?sku=${p.sku}">View Details</a><a class="btn btn-secondary" href="https://wa.me/27716816131?text=Interested%20in%20${encodeURIComponent(p.sku)}">WhatsApp</a></div></div></div>`).join(''); }
  function renderGallery(items){ if(!galleryGrid) return; const thumbs=items.slice(0,6); galleryGrid.innerHTML=thumbs.map(p=>`<div class="card"><img src="${p.image}" alt="${p.name}" loading="lazy"/><div class="pad"><h4>${p.name}</h4></div></div>`).join(''); }
  async function init(){ const cfg=await loadConfig(); const items=await loadProducts(cfg); renderProducts(items); renderGallery(items); if(search){ search.addEventListener('input',()=>renderProducts(items)); } if(window.renderProductDetail){ const params=new URLSearchParams(location.search); const sku=params.get('sku'); const p=items.find(x=>x.sku===sku)||items[0]; const el=document.getElementById('product-detail'); el.innerHTML=`<div class="card"><img src="${p.image}" alt="${p.name}"/><div class="pad"><h1>${p.name}</h1><div class="price-badge">R${p.price.toLocaleString('en-ZA')}</div><p>${p.summary||''}</p><div class="cta-group"><a class="btn" href="#">Download Trial</a><a class="btn btn-secondary" href="#">View Docs</a></div></div></div>`; } }
  window.renderProductDetail=()=>{};
  init();
})();
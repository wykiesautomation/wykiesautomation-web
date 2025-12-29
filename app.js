async function loadConfig(){
  if(!window.CONFIG.scriptUrl){
    const res = await fetch('./config/config.json').catch(()=>fetch('./config/config.example.json'));
    window.CONFIG = await res.json();
  }
  return window.CONFIG;
}

async function renderHome(){
  const cfg = await loadConfig();
  const resP = await fetch(cfg.scriptUrl+'?route=products'); const { ok:okP, items:products } = await resP.json();
  const resG = await fetch(cfg.scriptUrl+'?route=gallery'); const { ok:okG, items:gallery } = await resG.json();
  if(!okP || !okG) return;
  const grid = document.getElementById('product-grid');

  function draw(list){
    grid.innerHTML = '';
    list.filter(p=>String(p.active).toLowerCase()==='true').forEach(p=>{
      grid.insertAdjacentHTML('beforeend', `
        <article class="card" data-sku="${p.sku}">
          <img src="${p.imageUrl}" alt="${p.caption||p.name}">
          <h3>${p.name}</h3>
          <p class="tiny muted">SKU: ${p.sku}</p>
          <p class="muted">${p.summary||''}</p>
          <p class="price">R ${Number(p.price_incl).toFixed(0)}</p>
          <div class="actions">
            <a href="product.html?sku=${p.sku}" class="btn">View Details</a>
            ${p.trialUrl?`<a href="${p.trialUrl}" class="btn">Download Trial</a>`:''}
          </div>
        </article>`);
    });
  }
  draw(products);

  const gp = document.getElementById('gallery-preview');
  (gallery||[]).slice(0,6).forEach(g=>{
    gp.insertAdjacentHTML('beforeend', `<figure class="card"><img src="${g.thumbUrl||g.imageUrl}" alt="${g.caption||g.name}"><figcaption class="tiny muted">${g.caption||g.name}</figcaption></figure>`);
  });

  const search = document.getElementById('product-search');
  if (search){
    search.addEventListener('input', ()=>{
      const q = (search.value||'').toLowerCase();
      const filtered = !q ? products : products.filter(p => [p.sku, p.name, p.summary].join(' ').toLowerCase().includes(q));
      draw(filtered);
    });
  }
}

if(document.getElementById('product-grid')) renderHome();

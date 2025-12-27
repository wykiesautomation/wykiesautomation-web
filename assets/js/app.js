
(function(){
  const state = {cfg:null, products:[], gallery:[]};

  async function loadCfg(){
    const res = await fetch('/config.json');
    state.cfg = await res.json();
  }

  function qs(name){
    const p = new URLSearchParams(location.search); return p.get(name);
  }

  function formatRand(v){
    return new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(Number(v));
  }

  function whatsappHref(text){
    const number = (state.cfg?.whatsapp||'').replace(/[^\d]/g,'');
    const t = encodeURIComponent(text||'Hi! I'm interested in your products.');
    return `https://wa.me/${number}?text=${t}`;
  }

  function buildProductCard(p){
    const a = document.createElement('article');
    a.className = 'card';
    a.innerHTML = `
      <div style="position:relative">
        <img loading="lazy" src="${p.imageUrl||'assets/images/placeholder-800x600.png'}" alt="${p.name}" />
        <span class="price-badge">${formatRand(p.price)}</span>
      </div>
      <div class="content">
        <h3>${p.name} <small style="color:#94a3b8">(${p.sku})</small></h3>
        <p>${p.summary||''}</p>
        <div class="product-actions">
          <a class="btn btn-primary" href="product.html?sku=${encodeURIComponent(p.sku)}">View Details</a>
          ${p.trialUrl?`<a class="btn" href="${p.trialUrl}" target="_blank" rel="noopener">Download Trial</a>`:''}
          ${p.docUrl?`<a class="btn" href="${p.docUrl}" target="_blank" rel="noopener">View Docs</a>`:''}
          <a class="btn btn-outline" href="${whatsappHref('I'm interested in '+p.sku+' - '+p.name)}">WhatsApp</a>
        </div>
      </div>`;
    return a;
  }

  function renderGrid(list){
    const grid = document.getElementById('productGrid'); if(!grid) return;
    grid.innerHTML = '';
    list.forEach(p=> grid.appendChild(buildProductCard(p)));
  }

  function applySearch(){
    const q = (document.getElementById('productSearch')?.value||'').trim().toLowerCase();
    const f = !q? state.products : state.products.filter(p=>[
      p.name,p.summary,p.sku
    ].join(' ').toLowerCase().includes(q));
    renderGrid(f);
  }

  async function fetchPublicData(){
    const base = state.cfg.appScriptUrl;
    const [prods, gallery] = await Promise.all([
      fetch(base+'?action=products').then(r=>r.json()).catch(()=>[]),
      fetch(base+'?action=gallery').then(r=>r.json()).catch(()=>[]),
    ]);
    state.products = (prods||[]).filter(p=>p.active!==false);
    state.gallery = gallery||[];
  }

  function renderGalleryPreview(){
    const el = document.getElementById('galleryGrid'); if(!el) return;
    el.innerHTML = '';
    state.gallery.slice(0,6).forEach(g=>{
      const a = document.createElement('article');
      a.className='card';
      a.innerHTML = `<img loading="lazy" src="${g.imageUrl}" alt="${g.caption||'Gallery image'}">`;
      el.appendChild(a);
    });
  }

  function renderGalleryPage(){
    const el = document.getElementById('galleryPageGrid'); if(!el) return;
    el.innerHTML = '';
    state.gallery.forEach(g=>{
      const a = document.createElement('article');
      a.className='card';
      a.innerHTML = `<img loading="lazy" src="${g.imageUrl}" alt="${g.caption||'Gallery image'}"><div class="content"><p>${g.caption||''}</p></div>`;
      el.appendChild(a);
    });
  }

  function renderProductPage(){
    const sku = qs('sku');
    const p = state.products.find(x=>x.sku===sku);
    const c = document.getElementById('productContainer'); if(!c||!p) return;
    c.innerHTML = `
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
        <div class="card"><img src="${p.imageUrl||'assets/images/placeholder-800x600.png'}" alt="${p.name}"></div>
        <div>
          <h1>${p.name} <small style="color:#94a3b8">(${p.sku})</small></h1>
          <p style="font-size:1.25rem;font-weight:700">${formatRand(p.price)}</p>
          <p>${p.description||p.summary||''}</p>
          <div class="product-actions">
            ${p.trialUrl?`<a class='btn' href='${p.trialUrl}' target='_blank' rel='noopener'>Download Trial</a>`:''}
            ${p.docUrl?`<a class='btn' href='${p.docUrl}' target='_blank' rel='noopener'>View Docs</a>`:''}
            <form id="payfastForm" method="post" style="display:none"></form>
            <button class="btn btn-primary" id="buyBtn">Buy Now</button>
            <a class="btn btn-outline" href="${whatsappHref('I want to order '+p.sku+' - '+p.name)}">WhatsApp</a>
          </div>
        </div>
      </div>`;
    const buyBtn = document.getElementById('buyBtn');
    buyBtn?.addEventListener('click', async()=>{
      const res = await fetch(state.cfg.appScriptUrl+'?action=createPayfastForm',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ sku: p.sku })
      });
      const data = await res.json();
      const form = document.getElementById('payfastForm');
      form.innerHTML='';
      Object.entries(data.fields||{}).forEach(([k,v])=>{
        const i = document.createElement('input'); i.type='hidden'; i.name=k; i.value=v; form.appendChild(i);
      });
      form.action = data.action; form.method='post';
      form.submit();
    });
  }

  function wireBasics(){
    const y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();
    const w1 = document.getElementById('whatsappTop'); if(w1) w1.href = whatsappHref();
    const w2 = document.getElementById('whatsappHero'); if(w2) w2.href = whatsappHref();
    const w3 = document.getElementById('whatsappBottom'); if(w3) w3.href = whatsappHref();
    const s = document.getElementById('productSearch'); if(s) s.addEventListener('input', applySearch);
  }

  (async function init(){
    await loadCfg();
    await fetchPublicData();
    wireBasics();
    const grid = document.getElementById('productGrid'); if(grid) renderGrid(state.products);
    renderGalleryPreview();
    renderGalleryPage();
    renderProductPage();
  })();
})();

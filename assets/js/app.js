
(function(){
  const state = { products: [], gallery: [], pricechanges: [], docs: [] };
  const fallbackProducts = [
    {sku:'WA-05', name:'GSM Gate Controller', price:1499, summary:'Remote control via GSM/Wi‑Fi', imageUrl:'assets/img/products/wa-05.png', trialUrl:'#', docUrl:'#'},
    {sku:'WA-02', name:'Plasma Cutter Control', price:2499, summary:'THC & cut job management', imageUrl:'assets/img/products/wa-02.png', trialUrl:'#', docUrl:'#'},
    {sku:'WA-03', name:'ECU/TCU Control System', price:6499, summary:'Automotive ECU/TCU GUI', imageUrl:'assets/img/products/wa-03.png', trialUrl:'#', docUrl:'#'},
    {sku:'WA-01', name:'3D Printer Control', price:1499, summary:'Starter kit', imageUrl:'assets/img/products/wa-01.png', trialUrl:'#', docUrl:'#'},
    {sku:'WA-07', name:'Hybrid Gate Controller', price:1800, summary:'Wi‑Fi + GSM hybrid control', imageUrl:'assets/img/products/wa-07.png', trialUrl:'#', docUrl:'#'},
    {sku:'WA-10', name:'12CH Hybrid Alarm', price:1299, summary:'Hybrid security channels', imageUrl:'assets/img/products/wa-10.png', trialUrl:'#', docUrl:'#'}
  ];
  const fallbackPriceChanges = [
    {timestamp:'2025-12-28 09:00', sku:'WA-05', oldPrice:1399, newPrice:1499, note:'Component cost'},
    {timestamp:'2025-12-26 09:00', sku:'WA-02', oldPrice:2299, newPrice:2499, note:'New features'}
  ];
  const fallbackDocs = [
    {title:'GSM Gate Controller — Datasheet', url:'#'},
    {title:'Plasma Cutter Control — User Manual', url:'#'},
    {title:'ECU/TCU Control — Design Overview', url:'#'}
  ];
  const fallbackGallery = Array.from({length:12}).map((_,i)=>({imageUrl:`assets/img/gallery/gallery-${String(i+1).padStart(2,'0')}.png`}));

  const $ = sel => document.querySelector(sel);
  const fmtR = x => 'R' + Math.round(x).toLocaleString('en-ZA');

  function productCard(p){
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <header><span>${p.name}</span></header>
      <img src="${p.imageUrl}" alt="${p.name}" loading="lazy">
      <div class="content">
        <div><span class="price">${fmtR(p.price)}</span><span class="badge">Pre‑Order</span></div>
        <p style="color:#94a3b8; margin:8px 0 0;">${p.summary||''}</p>
        <div class="actions">
          <a class="btn" href="product.html?sku=${encodeURIComponent(p.sku)}">View Details</a>
          <a class="btn" href="${p.docUrl||'#'}" target="_blank">View Docs</a>
          <a class="btn" href="${p.trialUrl||'#'}" target="_blank">Download Trial</a>
        </div>
      </div>`;
    return div;
  }

  function renderAll(){
    const featured = $('#featured-grid');
    const grid = $('#product-grid');
    const pct = $('#pc-table tbody');
    const docs = $('#docs-list');
    const gal = $('#gallery-grid');

    featured.innerHTML = '';
    state.products.slice(0,3).forEach(p=> featured.appendChild(productCard(p)));

    grid.innerHTML = '';
    state.products.forEach(p=> grid.appendChild(productCard(p)));

    pct.innerHTML = '';
    state.pricechanges.slice(0,10).forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.sku}</td><td>${fmtR(r.oldPrice)} → ${fmtR(r.newPrice)}</td><td>${r.timestamp}</td><td>${r.note||''}</td>`;
      pct.appendChild(tr);
    });

    docs.innerHTML = '';
    state.docs.forEach(d=>{
      const a = document.createElement('a'); a.href=d.url; a.textContent=d.title; a.className='link'; a.style.display='block'; a.target='_blank'; docs.appendChild(a);
    });

    gal.innerHTML = '';
    state.gallery.forEach(g=>{
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `<img src="${g.imageUrl}" alt="Gallery" loading="lazy"><div class="content"></div>`;
      card.querySelector('img').addEventListener('click',()=>openLightbox(g.imageUrl));
      gal.appendChild(card);
    });
  }
  function openLightbox(src){ const lb=document.querySelector('.lightbox'); lb.querySelector('img').src=src; lb.style.display='flex'; }
  window.closeLightbox = ()=>{ document.querySelector('.lightbox').style.display='none'; };

  // 1) Render immediate fallbacks (always visible, even file://)
  state.products = fallbackProducts.slice();
  state.pricechanges = fallbackPriceChanges.slice();
  state.docs = fallbackDocs.slice();
  state.gallery = fallbackGallery.slice();
  const status = document.getElementById('status');
  if(status) status.style.display='block';
  renderAll();

  // 2) Try to load live data (if available)
  fetch('config.json').then(r=>r.json()).then(cfg=>{
    const base = cfg.appsScriptUrl;
    const tryLoad = (path, assign) => fetch(base+path).then(r=>r.json()).then(data=>{ state[assign] = Array.isArray(data)&&data.length? data : state[assign]; renderAll(); }).catch(()=>{});
    tryLoad('?action=products','products');
    tryLoad('?action=pricechanges','pricechanges');
    tryLoad('?action=docs','docs');
    tryLoad('?action=gallery','gallery');
  }).catch(()=>{});

  // Contact form
  const waNum = '27716816131';
  const sel = document.getElementById('c-product');
  if(sel){ sel.innerHTML = '<option value="">Select…</option>' + state.products.map(p=>`<option value="${p.sku}">${p.sku} — ${p.name}</option>`).join(''); }
  const sendBtn = document.getElementById('c-send');
  const waBtn = document.getElementById('c-wa-btn');
  if(sendBtn) sendBtn.addEventListener('click',()=>{
    const payload = {
      name: document.getElementById('c-name').value.trim(),
      email: document.getElementById('c-email').value.trim(),
      phone: document.getElementById('c-phone').value.trim(),
      product: document.getElementById('c-product').value,
      message: document.getElementById('c-message').value.trim(),
      copyMe: document.getElementById('c-copy').checked,
      whatsapp: document.getElementById('c-wa').checked
    };
    if(!payload.name || !payload.email || !payload.message){ alert('Please fill in Name, Email, and Message.'); return; }
    // Post only if online; otherwise show saved message prompt
    fetch('config.json').then(r=>r.json()).then(cfg=>{
      return fetch(cfg.appsScriptUrl+'?action=contact_send',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
    }).then(r=>r.json()).then(data=>{ alert(data.message||'Sent'); }).catch(()=>{ alert('Saved locally (offline demo).'); });
  });
  if(waBtn) waBtn.addEventListener('click',()=>{
    const msg = document.getElementById('c-message').value.trim() || 'Hi Wykies Automation';
    const prod = document.getElementById('c-product').value;
    const text = prod ? (msg + ' — Product: ' + prod) : msg;
    waBtn.href = 'https://wa.me/' + waNum + '?text=' + encodeURIComponent(text);
  });
})();

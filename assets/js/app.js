
// Wykies Automation Public JS
(async function(){
  const cfg = await fetch('config.json').then(r=>r.json());
  const waNum = cfg.whatsappNumber.replace('+','');
  const appBase = cfg.appsScriptUrl;

  const state = { products: [], gallery: [] };

  async function loadProducts(){
    try {
      const res = await fetch(appBase + '?action=products');
      state.products = await res.json();
    } catch(e){
      // Fallback demo data
      state.products = [
        {sku:'WA-01', name:'3D Printer Control V1', price:1499.00, summary:'Starter kit', imageUrl:'assets/img/products/wa-01.png', trialUrl:'#'},
        {sku:'WA-02', name:'Plasma Cutter Control V1', price:2499.00, summary:'Precision plasma control', imageUrl:'assets/img/products/wa-02.png', trialUrl:'#'},
        {sku:'WA-03', name:'ECU/TCU Control System V1', price:6499.00, summary:'Engine & gearbox', imageUrl:'assets/img/products/wa-03.png', trialUrl:'#'}
      ];
    }
  }

  async function loadGallery(){
    try {
      const res = await fetch(appBase + '?action=gallery');
      state.gallery = await res.json();
    } catch(e){
      // Fallback demo gallery
      state.gallery = Array.from({length:6}).map((_,i)=>({
        caption:`Gallery ${i+1}`, imageUrl:`assets/img/gallery/gallery-0${i+1}.png`
      }));
    }
  }

  function fmtRand(price){ return 'R' + price.toLocaleString('en-ZA', {minimumFractionDigits:0}); }

  function renderProducts(){
    const grid = document.getElementById('product-grid');
    if(!grid) return;
    grid.innerHTML = '';
    const q = (document.getElementById('search')?.value || '').toLowerCase();
    state.products.filter(p=>!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.summary||'').toLowerCase().includes(q))
      .forEach(p=>{
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
          <img src="${p.imageUrl}" alt="${p.name}" loading="lazy">
          <div class="content">
            <span class="price-badge">${fmtRand(p.price)}</span>
            <h3>${p.name}</h3>
            <p>${p.summary||''}</p>
            <div style="display:flex; gap:8px;">
              <a class="btn" href="product.html?sku=${encodeURIComponent(p.sku)}">View Details</a>
              <a class="btn" href="${p.trialUrl||'#'}" target="_blank">Download Trial</a>
              <a class="btn secondary" href="https://wa.me/${waNum}?text=${encodeURIComponent('Hi, I am interested in '+p.sku+' - '+p.name)}" target="_blank">WhatsApp</a>
            </div>
          </div>`;
        grid.appendChild(div);
      });
  }

  function renderGallery(){
    const grid = document.getElementById('gallery-grid');
    if(!grid) return;
    grid.innerHTML = '';
    state.gallery.forEach(g=>{
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <img src="${g.imageUrl}" alt="${g.caption}" loading="lazy">
        <div class="content"><p>${g.caption||''}</p></div>`;
      div.querySelector('img').addEventListener('click', ()=>openLightbox(g.imageUrl));
      grid.appendChild(div);
    });
  }

  function openLightbox(src){
    const lb = document.querySelector('.lightbox');
    lb.querySelector('img').src = src; lb.style.display='flex';
  }
  function closeLightbox(){ document.querySelector('.lightbox').style.display='none'; }
  window.closeLightbox = closeLightbox;

  // Initialize
  await loadProducts();
  await loadGallery();
  renderProducts();
  renderGallery();
  const s = document.getElementById('search'); if(s) s.addEventListener('input', renderProducts);
})();

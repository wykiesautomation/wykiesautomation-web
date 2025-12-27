/* Wykies Automation public site JS */
(async function(){
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const cfg = await fetch('./config.json').then(r=>r.json()).catch(()=>({env:'dev'}));

  function enforcePngOnly(){
    const imgs = Array.from(document.querySelectorAll('img'));
    imgs.forEach(img=>{
      const src = img.getAttribute('src')||'';
      if (src && !src.startsWith('data:') && !src.toLowerCase().endsWith('.png')){
        console.warn('Non-PNG image detected', src);
      }
    });
  }
  enforcePngOnly();

  const productGrid = document.getElementById('productGrid');
  if (!productGrid) return;

  const devProducts = [
    { sku:'WA-01', name:'3D Printer Control V1', price:1499, summary:'Desktop control app', imageUrl:'./assets/img/wa-01.png' },
    { sku:'WA-02', name:'Plasma Cutter Control V1', price:2499, summary:'CNC plasma control', imageUrl:'./assets/img/wa-02.png' },
    { sku:'WA-03', name:'ECU/TCU Control System V1', price:6499, summary:'Engine & gearbox', imageUrl:'./assets/img/wa-03.png' },
    { sku:'WA-04', name:'Fridge/Freezer Control V1', price:899, summary:'Cold chain', imageUrl:'./assets/img/wa-04.png' },
    { sku:'WA-05', name:'Nano GSM Gate Controller V1', price:800, summary:'GSM gate', imageUrl:'./assets/img/wa-05.png' },
    { sku:'WA-06', name:'Solar Energy Management System V1', price:3999, summary:'Solar', imageUrl:'./assets/img/wa-06.png' },
    { sku:'WA-07', name:'Hybrid Gate Controller V1', price:1800, summary:'Hybrid gate', imageUrl:'./assets/img/wa-07.png' },
    { sku:'WA-08', name:'Smart Battery Charger V1', price:999, summary:'Charger', imageUrl:'./assets/img/wa-08.png' },
    { sku:'WA-09', name:'Gate/Garage Controller V1', price:1009, summary:'Gate/Garage', imageUrl:'./assets/img/wa-09.png' },
    { sku:'WA-10', name:'12CH Hybrid Alarm V1', price:1299, summary:'Alarm 12CH', imageUrl:'./assets/img/wa-10.png' },
    { sku:'WA-11', name:'16CH Hybrid Alarm V1', price:5499, summary:'Alarm 16CH', imageUrl:'./assets/img/wa-11.png' }
  ];

  async function fetchProducts(){
    if (cfg.env !== 'prod') return devProducts;
    try{
      const url = cfg.apps_script_url + '?route=products';
      const res = await fetch(url, { cache: 'no-store' });
      return await res.json();
    }catch(e){ console.error(e); return devProducts; }
  }

  function currency(n){ return 'R' + n.toLocaleString('en-ZA'); }

  function render(products){
    productGrid.innerHTML = products.map(p=>`
      <article class="card" data-sku="${p.sku}">
        <img src="${p.imageUrl}" alt="${p.name}" loading="lazy" />
        <div class="body">
          <div class="price">${currency(p.price)} (incl. VAT)</div>
          <strong>${p.name}</strong>
          <p>${p.summary||''}</p>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <a class="btn" href="#downloads" aria-label="Download trial for ${p.sku}">Trial</a>
            <a class="btn btn-outline" href="#documents" aria-label="View docs for ${p.sku}">Docs</a>
            <a class="btn" target="_blank" rel="noopener" href="https://wa.me/27716816131?text=Hi%2C%20I%27m%20interested%20in%20${encodeURIComponent(p.sku)}">WhatsApp</a>
          </div>
        </div>
      </article>
    `).join('');
  }

  render(await fetchProducts());
})();

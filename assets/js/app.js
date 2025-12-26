
/* Public site logic */
(async function(){
  const cfg = await fetch('config.json').then(r=>r.json()).catch(()=>({env:'sandbox'}));
  const q = s=>document.querySelector(s);
  const qa = s=>Array.from(document.querySelectorAll(s));

  // Populate products grid from Apps Script, fallback to local products.json
  async function loadProducts(){
    let products;
    try {
      const url = cfg.appsScriptUrl + '?action=products&sheetId=' + encodeURIComponent(cfg.sheetId);
      const res = await fetch(url, {cache:'no-store'});
      if(!res.ok) throw new Error('HTTP ' + res.status);
      products = await res.json();
    } catch(e){
      products = await fetch('assets/js/products.json').then(r=>r.json());
      console.warn('Using local products.json fallback:', e.message);
    }
    const grid = q('#products-grid');
    if(!grid) return;
    grid.innerHTML = products.filter(p=>p.active!==false).map(p=>`
      <div class="card">
        <img src="${p.imageUrl}" alt="${p.name} product image" loading="lazy">
        <div class="pad">
          <div class="price">R${p.price.toLocaleString('en-ZA')}</div>
          <h3>${p.name}</h3>
          <p>${p.summary||''}</p>
          <button class="btn" onclick="location.href='product.html?sku=${encodeURIComponent(p.sku)}'">View Details</button>
        </div>
      </div>
    `).join('');
  }

  // Lightbox for gallery
  function setupLightbox(){
    const lb = q('#lightbox');
    qa('.gallery img').forEach(img=>{
      img.addEventListener('click',()=>{ lb.style.display='flex'; q('#lightbox-img').src = img.src; });
    });
    lb.addEventListener('click',()=> lb.style.display='none');
  }

  // Contact form -> Apps Script email
  function setupContact(){
    const form = q('#contactForm');
    if(!form) return;
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      try{
        const res = await fetch(cfg.appsScriptUrl, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'contact', sheetId:cfg.sheetId, payload:data})});
        if(!res.ok) throw new Error('Submit failed');
        alert('Thanks! We'll get back to you by email.');
        form.reset();
      }catch(err){
        alert('Submission failed. Please try again later.');
      }
    });
  }

  // PayFast checkout init via server (Worker/Apps Script) — placeholder
  async function initCheckout(sku){
    const res = await fetch(cfg.apiBase + '/payfast/init', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({sku})});
    if(!res.ok){ alert('Checkout init failed'); return; }
    const htmlForm = await res.text();
    const div = document.createElement('div');
    div.innerHTML = htmlForm; // server returns signed form auto-submitting to PayFast
    document.body.appendChild(div);
    const f = div.querySelector('form');
    if(f) f.submit();
  }
  window.initCheckout = initCheckout;

  loadProducts();
  setupLightbox();
  setupContact();
})();

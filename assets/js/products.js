
(function(){
  const grid = document.getElementById('product-grid');
  const apps = (window.config && window.config.appsScriptUrl) || '';

  async function fetchProducts(){
    if(apps){
      try{ const r = await fetch(apps + '?entity=products'); if(r.ok) return r.json(); }catch(e){}
    }
    const r = await fetch('assets/js/products.sample.json');
    return r.json();
  }

  function card(p){
    const trial = p.trialUrl || '#';
    const docs  = p.docUrl   || '#';
    const wa = 'https://wa.me/27716816131?text=' + encodeURIComponent('Hi, I am interested in ' + (p.sku||'') + ' — ' + (p.name||''));
    const base = (p.imageUrl || ('assets/img/' + (p.sku||'wa-xx').toLowerCase() + '.png'));
    return `
    <article class="card">
      <img src="${base}" alt="${p.name||'Product'}">
      <div class="content">
        <h3>${p.name||''}</h3>
        <p>${p.summary||''}</p>
        <p class="price">R${Number(p.price||0).toLocaleString()}</p>
        <div>
          <a class="btn" href="${trial}" target="_blank" rel="noopener">Download Trial</a>
          <a class="btn secondary" href="${docs}" target="_blank" rel="noopener">View Docs</a>
          <a class="btn outline" href="${wa}" target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </div>
    </article>`;
  }

  fetchProducts().then(list=>{
    const items = (list||[]).filter(p=>p.active!==false);
    if(!items.length){ grid.innerHTML = '<p>No products found.</p>'; return; }
    grid.innerHTML = items.map(card).join('');
  });
})();

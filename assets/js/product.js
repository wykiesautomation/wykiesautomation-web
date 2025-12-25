(async function(){
  const url = new URL(location.href);
  const sku = url.searchParams.get('sku');
  const p = await fetchProduct(sku);
  const root = document.getElementById('product');
  if(!p){ root.innerHTML='<p>Product not found.</p>'; return; }
  document.title = `${p.name} — Wykies Automation`;
  document.getElementById('desc').setAttribute('content', p.summary||p.description||'');
  root.innerHTML = `
    <div class="card">
      <img src="${p.imageUrl}" alt="${p.name}">
      <div class="content">
        <h1>${p.name}</h1>
        <p class="price">R ${p.price.toLocaleString('en-ZA',{minimumFractionDigits:2})} (VAT incl.)</p>
        <p>${p.description||''}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn" onclick="location.href='mailto:wykiesautomation@gmail.com?subject=${encodeURIComponent(p.sku+' '+p.name)}'">Email</button>
          <button class="btn secondary" onclick="window.open('https://wa.me/27716816131?text='+encodeURIComponent('Hi, I am interested in '+p.sku+' '+p.name),'_blank')">WhatsApp</button>
          ${p.trialUrl?`<a class='btn' href='${p.trialUrl}' download>Download Trial (.exe)</a>`:''}
          ${p.docUrl?`<a class='btn secondary' href='${p.docUrl}' target='_blank'>Documentation</a>`:''}
        </div>
      </div>
    </div>`;
})();
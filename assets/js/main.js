
// main.js — load catalog on Home
(async function(){
  const data = await waApi('products');
  const list = document.getElementById('productGrid');
  list.innerHTML = '';
  data.items.filter(p=> String(p.active).toLowerCase()==='true').forEach(p=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.imageUrl||'assets/img/placeholder-product.jpg'}" alt="${p.name}">
      <div class="body">
        <div class="badge">${p.sku}</div>
        <h3 style="margin:6px 0 4px;">${p.name}</h3>
        <div class="price">${currencyZAR(p.price)}</div>
        <p style="min-height:42px;">${p.summary||''}</p>
        <div class="toolbar">
          <a class="btn" href="product.html?sku=${encodeURIComponent(p.sku)}">View</a>
          <button class="btn secondary" onclick="buyNow('${p.sku}', ${p.price}, '${p.name.replace("'","'")}')">Buy via PayFast</button>
          ${p.trialUrl?`<a class="btn secondary" href="${p.trialUrl}" target="_blank">Trial</a>`:''}
          ${p.docUrl?`<a class="btn secondary" href="${p.docUrl}" target="_blank">Docs</a>`:''}
        </div>
      </div>`;
    list.appendChild(card);
  });
})();

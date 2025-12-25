(async function(){
  const container = document.getElementById('products');
  const products = await fetchProducts();
  for(const p of products){
    if(p.active){
      const card = document.createElement('article');
      card.className='card';
      card.innerHTML = `
        <img src="${p.imageUrl}" alt="${p.name}">
        <div class="content">
          <h3>${p.name}</h3>
          <p class="price">R ${p.price.toLocaleString('en-ZA',{minimumFractionDigits:2})}</p>
          <p>${p.summary||''}</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn" onclick="location.href='product.html?sku=${p.sku}'">View</button>
            <button class="btn secondary" onclick="location.href='mailto:wykiesautomation@gmail.com?subject=${encodeURIComponent(p.sku+' '+p.name)}'">Email</button>
            <button class="btn secondary" onclick="window.open('https://wa.me/27716816131?text='+encodeURIComponent('Hi, I am interested in '+p.sku+' '+p.name),'_blank')">WhatsApp</button>
          </div>
        </div>`;
      container.appendChild(card);
    }
  }
})();
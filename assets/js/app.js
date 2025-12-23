(async () => {
  const grid = document.getElementById('product-grid');
  const { api } = await window.__ensureApi();
  try {
    const products = await api.get('products');
    if(!Array.isArray(products) || !products.length) throw 0;
    grid.innerHTML = '';
    for(const p of products){
      if(String(p.enabled).toLowerCase()==='false') continue;
      const card = document.createElement('a');
      card.className='card card-img';
      card.href=`/product.html?sku=${encodeURIComponent(p.sku)}`;
      card.innerHTML = `
        <img loading="lazy" src="${p.image||'/assets/img/placeholder.png'}" alt="${p.name}">
        <div class="caption"><strong>${p.name}</strong><br/>R${Number(p.price).toLocaleString('en-ZA')}</div>`;
      grid.appendChild(card);
    }
  } catch (e) {
    grid.innerHTML = `<p class="error">Products will appear once the CMS is connected. Configure <code>config.json</code>.</p>`;
  }
})();


(async function(){
  const { items } = await API.get('products');
  const grid = qs('#productGrid');
  grid.innerHTML = items.map(p=>{
    const price = Currency.format(p.price);
    const img = p.imageUrl || 'assets/img/placeholder.png';
    const waMsg = encodeURIComponent(`Hi Wykies Automation, I'm interested in ${p.sku} — ${p.name}.`);
    const waHref = `https://wa.me/${CONFIG.whatsappNumber}?text=${waMsg}`;
    return `
      <div class="card">
        <img src="${img}" alt="${p.name}" />
        <div class="content">
          <div><span class="badge">${p.sku}</span></div>
          <h3>${p.name}</h3>
          <div class="price">${price}</div>
          <p>${p.summary||''}</p>
          <div class="btn-row">
            <button onclick="EmailForm.populateSkuList('${p.sku}'); EmailForm.open()" class="secondary">Email</button>
            <a class="btn outline" href="${waHref}" target="_blank">WhatsApp</a>
            <a class="btn" href="product.html?sku=${p.sku}">Details</a>
          </div>
        </div>
      </div>`;
  }).join('');
})();

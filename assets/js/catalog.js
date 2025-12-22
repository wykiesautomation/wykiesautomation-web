(async () => {
  try {
    const res = await fetch('products.json', { cache: 'no-store' });
    const PRODUCTS = await res.json();
    const GRID = document.getElementById('products') || document.getElementById('productGrid');
    if (GRID) {
      GRID.innerHTML = PRODUCTS.map(p => `
        <article class="card">
          <small class="badge">${p.sku}</small>
          ${p.image ? `<img class="gallery-item" src="${p.image}" alt="${p.name}">`
                    : `<div class="imgph">No image</div>`}
          <h3>${p.name}</h3>
          <div class="price">${p.price}</div>
          <button class="btn" onclick="location.href='product.html?code=${encodeURIComponent(p.sku)}'">View</button>
        </article>
      `).join('');
    }
    const productSelect = document.getElementById('product') || document.getElementById('productSelect');
    if (productSelect) {
      PRODUCTS.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.sku;
        opt.textContent = `${p.sku} — ${p.name}`;
        productSelect.appendChild(opt);
      });
    }
  } catch (err) { console.error('Failed to load products.json', err); }
})();

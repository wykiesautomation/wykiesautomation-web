
(function(){
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  async function loadConfig(){
    const res = await fetch('config.json');
    return res.json();
  }

  async function loadProducts(){
    const cfg = await loadConfig();
    const grid = document.getElementById('product-grid');
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    try {
      const url = cfg.apiBase + '/products';
      const res = await fetch(url);
      const data = await res.json();
      if (id){
        const p = data.products.find(x => String(x.id) === String(id));
        renderProductDetail(p);
      } else {
        renderProductGrid(data.products || []);
      }
    } catch(e){
      console.error('Failed to fetch products', e);
      if (grid) grid.innerHTML = '<div class="alert alert-warning">Product data is not available yet. Admin needs to deploy the Apps Script API.</div>';
    }
  }

  function renderProductGrid(products){
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    if (!products.length){
      grid.innerHTML = '<p class="text-muted">No products yet.</p>';
      return;
    }
    grid.innerHTML = products.map(p => `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card h-100">
          <img class="card-img-top" src="${p.image || 'assets/placeholder.png'}" alt="${p.name}"/>
          <div class="card-body">
            <h5 class="card-title">${p.name}</h5>
            <p class="card-text">${p.summary || ''}</p>
            <p class="fw-bold">R ${Number(p.price).toFixed(2)} (incl. VAT)</p>
            <a class="btn btn-primary" href="product.html?id=${p.id}">View</a>
          </div>
        </div>
      </div>`).join('');
  }

  function renderProductDetail(p){
    const el = document.getElementById('product-detail');
    if (!el) return;
    if (!p){ el.innerHTML = '<div class="alert alert-danger">Product not found.</div>'; return; }
    el.innerHTML = `
      <div class="col-12 col-lg-6">
        <img class="img-fluid rounded" src="${p.image || 'assets/placeholder.png'}" alt="${p.name}">
      </div>
      <div class="col-12 col-lg-6">
        <h2>${p.name}</h2>
        <p>${p.description || ''}</p>
        <p class="fs-4 fw-bold">R ${Number(p.price).toFixed(2)} (incl. VAT)</p>
        <a class="btn btn-accent" href="#" onclick="alert('PayFast checkout is configured server-side.'); return false;">Buy with PayFast</a>
      </div>`;
  }

  // auto-init
  if (document.getElementById('product-grid') || document.getElementById('product-detail')){
    loadProducts();
  }
})();

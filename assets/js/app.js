// Minimal client-side loader
const PRODUCTS = [
  {sku:'WA-01', name:'3D Printer Control V1', price:1499, image:'assets/img/wa-01.png', summary:'Desktop control UI', active:true},
  {sku:'WA-02', name:'Plasma Cutter Control V1', price:2499, image:'assets/img/wa-02.png', summary:'Plasma cut control', active:true},
  {sku:'WA-03', name:'ECU/TCU Control System V1', price:6499, image:'assets/img/wa-03.png', summary:'Vehicle ECU/TCU', active:true}
];

function renderProducts(){
  const grid = document.getElementById('productGrid'); if (!grid) return;
  grid.innerHTML = PRODUCTS.filter(p=>p.active).map(p => `
    <div class="card">
      <img src="${p.image}" alt="${p.name}" loading="lazy"/>
      <div class="body">
        <div class="price">R${p.price.toFixed(2)}</div>
        <h3>${p.sku} — ${p.name}</h3>
        <p>${p.summary}</p>
        <a class="btn" href="product.html?sku=${encodeURIComponent(p.sku)}">View Details</a>
      </div>
    </div>`).join('');
}
function renderGallery(){
  const grid = document.getElementById('galleryGrid'); if (!grid) return;
  grid.innerHTML = PRODUCTS.map(p => `
    <div class="card">
      <img src="${p.image}" alt="${p.name}" loading="lazy"/>
      <div class="body"><h3>${p.sku}</h3><p>${p.name}</p></div>
    </div>`).join('');
}
function renderProductPage(){
  const el = document.getElementById('product'); if (!el) return;
  const sku = new URLSearchParams(location.search).get('sku');
  const p = PRODUCTS.find(x=>x.sku===sku) || PRODUCTS[0];
  el.innerHTML = `
    <h2>${p.sku} — ${p.name}</h2>
    <div class="price">R${p.price.toFixed(2)}</div>
    <img src="${p.image}" alt="${p.name}" loading="lazy"/>
    <p>${p.summary}</p>`;
}
renderProducts(); renderGallery(); renderProductPage();

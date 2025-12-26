/* Public app bootstrap */
const configUrl = 'config.json';
const productsGrid = document.getElementById('products');
const galleryGrid = document.getElementById('gallery');
const searchBox = document.getElementById('searchBox');

fetch(configUrl).then(r=>r.json()).then(cfg=>{
  window.__CFG__ = cfg;
  document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());
  loadProducts();
  loadGallery();
});

function matches(q, p){
  if(!q) return true;
  q = q.toLowerCase();
  return (p.name+p.summary+p.sku).toLowerCase().includes(q);
}

function loadProducts(){
  if(!productsGrid) return;
  const list = window.__CFG__.products || [];
  const q = searchBox ? searchBox.value : '';
  productsGrid.innerHTML = list.filter(p=>matches(q,p)).map(p=>`<div class='card'>
    <img src="${p.imageUrl}" alt="${p.name}"/>
    <h3>${p.name} <span class='price'>R${p.price} (incl.)</span></h3>
    <p>${p.summary}</p>
    <a class='btn outline' href='product.html?sku=${p.sku}'>View Details</a>
  </div>`).join('');
}

function loadGallery(){
  if(!galleryGrid) return;
  const list = window.__CFG__.products || [];
  const q = searchBox ? searchBox.value : '';
  galleryGrid.innerHTML = list.filter(p=>matches(q,p)).map(p=>`<figure>
    <img src="${p.imageUrl}" alt="${p.name}"/>
    <figcaption>${p.sku} — ${p.name}</figcaption>
  </figure>`).join('');
}

searchBox && searchBox.addEventListener('input', ()=>{
  loadProducts();
  loadGallery();
});

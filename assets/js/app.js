
// Wykies Automation v4.3 — Public Site JS
const CONFIG_URL = 'config.json';
const PRODUCTS_URL = 'products.json';

const q = sel => document.querySelector(sel);
const qa = sel => document.querySelectorAll(sel);

async function loadConfig(){
  const r = await fetch(CONFIG_URL); return r.json();
}
async function loadProducts(){
  const r = await fetch(PRODUCTS_URL); return r.json();
}

function formatPrice(r){return 'R'+ r.toLocaleString('en-ZA');}

function waLink(sku){return 'https://wa.me/27716816131?text='+encodeURIComponent('Hi Wykies Automation — I\'m interested in '+sku);}

function renderProducts(list){
  const grid = q('#products-grid');
  grid.innerHTML = '';
  list.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="assets/img/products/${p.image}" alt="${p.name}">
      <div class="content">
        <div class="section-title">${p.sku} — ${p.name}</div>
        <div class="price">${formatPrice(p.price)} <span class="muted">Incl. VAT</span></div>
        <p class="muted">${p.summary}</p>
        <div class="cta-row">
          <a class="btn primary" href="product.html?sku=${p.sku}">View Details</a>
          <a class="btn outline" href="${p.trialUrl}">Download Trial</a>
          <a class="btn outline" href="${p.docUrl}">View Docs</a>
          <a class="btn ghost" href="${waLink(p.sku)}" target="_blank">WhatsApp</a>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

async function initHome(){
  const products = await loadProducts();
  renderProducts(products);
  const input = q('#search-input');
  input.addEventListener('input',()=>{
    const term = input.value.trim().toLowerCase();
    const filtered = products.filter(p=> (p.name+p.summary+p.sku).toLowerCase().includes(term));
    renderProducts(filtered);
  });
}

async function initProductsPage(){
  const products = await loadProducts();
  renderProducts(products);
  const input = q('#search-input');
  input.addEventListener('input',()=>{
    const term = input.value.trim().toLowerCase();
    const filtered = products.filter(p=> (p.name+p.summary+p.sku).toLowerCase().includes(term));
    renderProducts(filtered);
  });
}

async function initProductDetail(){
  const url = new URL(window.location.href);
  const sku = url.searchParams.get('sku');
  const products = await loadProducts();
  const p = products.find(x=>x.sku===sku) || products[0];
  q('#pd-img').src = 'assets/img/products/'+p.image;
  q('#pd-title').textContent = `${p.sku} — ${p.name}`;
  q('#pd-price').textContent = `${formatPrice(p.price)} Incl. VAT`;
  q('#pd-desc').textContent = p.description;
  q('#btn-buy').href = '#'; // Placeholder for PayFast checkout
  q('#btn-trial').href = p.trialUrl;
  q('#btn-docs').href = p.docUrl;
  q('#btn-wa').href = waLink(p.sku);
}

// Gallery lightbox
function initGallery(){
  const lb = q('#lightbox');
  qa('.gallery img').forEach(img=>{
    img.addEventListener('click',()=>{ lb.querySelector('img').src = img.src; lb.style.display='flex'; });
  });
  lb.addEventListener('click',()=>{ lb.style.display='none'; });
}

export { initHome, initProductsPage, initProductDetail, initGallery };

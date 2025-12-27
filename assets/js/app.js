
const products = [
  {sku:'WA-01', name:'3D Printer Control V1', price:1499, img:'/assets/img/wa-01.svg', summary:'Reliable desktop controller', active:true},
  {sku:'WA-02', name:'Plasma Cutter Control V1', price:2499, img:'/assets/img/wa-02.svg', summary:'CNC plasma cutting control', active:true},
  {sku:'WA-03', name:'ECU/TCU Control System V1', price:6499, img:'/assets/img/wa-03.svg', summary:'Automotive control suite', active:true},
  {sku:'WA-07', name:'Hybrid Gate Controller V1', price:1800, img:'/assets/img/wa-07.svg', summary:'Wi‑Fi/GSM hybrid gate control', active:true},
  {sku:'WA-10', name:'12CH Hybrid Alarm V1', price:1299, img:'/assets/img/wa-10.svg', summary:'12‑channel hybrid alarm', active:true},
  {sku:'WA-11', name:'16CH Hybrid Alarm V1', price:5499, img:'/assets/img/wa-11.svg', summary:'16‑channel hybrid alarm', active:true}
];

function formatR(price){return 'R' + price.toLocaleString('en-ZA');}

function renderProducts(list){
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  list.filter(p=>p.active).forEach(p=>{
    const li = document.createElement('li');
    li.className = 'card';
    li.innerHTML = `
      <div class="card-media">
        <img loading="lazy" src="${p.img}" alt="${p.name}" onerror="this.src='/assets/img/placeholder.svg'"/>
      </div>
      <div class="card-body">
        <span class="price-badge">${formatR(p.price)} (incl. VAT)</span>
        <h3 style="margin:0">${p.name}</h3>
        <p style="margin:0">${p.summary}</p>
        <div class="card-actions">
          <a class="btn btn-primary" href="/product.html?sku=${p.sku}">View Details</a>
          <a class="btn btn-outline" href="https://wa.me/27716816131?text=Interested%20in%20${encodeURIComponent(p.sku)}">WhatsApp</a>
        </div>
      </div>`;
    grid.appendChild(li);
  });
}

function renderGallery(){
  const grid = document.getElementById('galleryGrid');
  const items = products.slice(0,6);
  items.forEach((p)=>{
    const li = document.createElement('li');
    li.className = 'gallery-item';
    li.innerHTML = `
      <div class="media"><img loading="lazy" src="${p.img}" alt="${p.name} image" onerror="this.src='/assets/img/placeholder.svg'"/></div>
      <div class="caption">${p.sku} · ${p.name}</div>`;
    grid.appendChild(li);
  })
}

function setupSearch(){
  const el = document.getElementById('search');
  el.addEventListener('input',()=>{
    const q = el.value.trim().toLowerCase();
    const filtered = products.filter(p=> (p.sku + ' ' + p.name + ' ' + p.summary).toLowerCase().includes(q));
    renderProducts(filtered);
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  renderProducts(products);
  renderGallery();
  setupSearch();
});


const CONFIG_URL = '../config.json';
let CONFIG = null;

async function loadConfig(){ const r = await fetch(CONFIG_URL); CONFIG = await r.json(); }
async function fetchJSON(url){ try{ const r = await fetch(url,{cache:'no-store'}); if(!r.ok) throw new Error('HTTP '+r.status); return await r.json(); } catch(e){ console.warn('fetch failed', e); return null; } }

const STATIC_PRODUCTS = [
  {sku:'WA-01',name:'3D Printer Control V1',price:1499,summary:'Desktop GUI + controller',imageUrl:'assets/img/wa-01.png',active:true},
  {sku:'WA-02',name:'Plasma Cutter Control V1',price:2499,summary:'PyQt5 GUI prototype',imageUrl:'assets/img/wa-02.png',active:true},
  {sku:'WA-03',name:'ECU/TCU Control System V1',price:6499,summary:'Modern + Legacy variants',imageUrl:'assets/img/wa-03.png',active:true},
  {sku:'WA-04',name:'Fridge/Freezer Control V1',price:899,summary:'Sensor-driven control',imageUrl:'assets/img/wa-04.png',active:true},
  {sku:'WA-05',name:'Nano GSM Gate Controller V1',price:800,summary:'Arduino Nano GSM',imageUrl:'assets/img/wa-05.png',active:true},
  {sku:'WA-06',name:'Solar Energy Management V1',price:3999,summary:'Energy dashboard',imageUrl:'assets/img/wa-06.png',active:true},
  {sku:'WA-07',name:'Hybrid Gate Controller V1',price:1800,summary:'ESP32 + H-Bridge',imageUrl:'assets/img/wa-07.png',active:true},
  {sku:'WA-08',name:'Smart Battery Charger V1',price:999,summary:'Multi-stage charging',imageUrl:'assets/img/wa-08.png',active:true},
  {sku:'WA-09',name:'Gate/Garage Controller V1',price:1009,summary:'Wi-Fi/Bluetooth',imageUrl:'assets/img/wa-09.png',active:true},
  {sku:'WA-10',name:'12CH Hybrid Alarm V1',price:1299,summary:'Wi‑Fi primary, GSM fallback',imageUrl:'assets/img/wa-10.png',active:true},
  {sku:'WA-11',name:'16CH Hybrid Alarm V1',price:5499,summary:'ESP32-only alarm',imageUrl:'assets/img/wa-11.png',active:true},
  {sku:'WA-12',name:'TCU Gearbox Controller V1',price:4500,summary:'Configurable gears',imageUrl:'assets/img/wa-12.png',active:true}
];

function fmtRand(num){ return 'R'+Number(num).toLocaleString('en-ZA'); }
function renderProducts(list){ const grid=document.getElementById('products'); if(!grid) return; grid.innerHTML=''; list.forEach(p=>{ const card=document.createElement('div'); card.className='card'; card.innerHTML=`
<img src="${p.imageUrl}" alt="${p.name}" loading="lazy"/>
<div class="body">
  <div style="display:flex;justify-content:space-between;align-items:center">
    <strong>${p.name}</strong>
    <span class="badge">${fmtRand(p.price)} incl. VAT</span>
  </div>
  <p>${p.summary||''}</p>
  <a class="btn" href="product.html?sku=${p.sku}">View Details</a>
</div>`; grid.appendChild(card); }); }
function renderGalleryPreview(items){ const grid=document.getElementById('galleryPreview'); if(!grid) return; grid.innerHTML=''; (items||STATIC_PRODUCTS).slice(0,6).forEach(it=>{ const img=document.createElement('img'); img.src = it.url || it.imageUrl; img.alt = it.caption || it.name || 'Gallery'; img.loading='lazy'; grid.appendChild(img); }); }
function setupSearch(PRODUCTS){ const input=document.getElementById('search'); if(!input) return; input.addEventListener('input', e=>{ const q=e.target.value.toLowerCase(); const filtered=PRODUCTS.filter(p=> (p.name||'').toLowerCase().includes(q) || (p.summary||'').toLowerCase().includes(q) || (p.sku||'').toLowerCase().includes(q)); renderProducts(filtered); }); }
async function bootstrap(){ await loadConfig(); const base=(CONFIG.cms?.apps_script_base_url||''); const pro=await fetchJSON(base+'?action=listProducts'); const gal=await fetchJSON(base+'?action=listGallery'); const PRODUCTS=(pro && pro.items && pro.items.length)? pro.items : STATIC_PRODUCTS; renderProducts(PRODUCTS); renderGalleryPreview((gal && gal.items)? gal.items : null); setupSearch(PRODUCTS); }
document.addEventListener('DOMContentLoaded', bootstrap);

const state = { buildId: 'WA-WEB-20260102-165645' };
const qs = s=>document.querySelector(s);

const OFFLINE = true; // flip to false in production
const API_BASE = '/api';

const MOCK_PRODUCTS = [
  {id:'WA-01', title:'ESP32 Gate Opener (Wi‑Fi/BLE)', price:1499, img:'./images/wa01.png'},
  {id:'WA-02', title:'GSM Gate Opener (Nano)', price:2499, img:'./images/wa02.png'},
  {id:'WA-03', title:'Hybrid Universal Gate Controller', price:6499, img:'./images/wa03.png'},
  {id:'WA-04', title:'16‑ch ESP32 Alarm (Wi‑Fi)', price:899, img:'./images/wa04.png'},
  {id:'WA-05', title:'12‑ch Wi‑Fi + GSM Alarm', price:800, img:'./images/wa05.png'},
  {id:'WA-06', title:'Plasma Cutter GUI (Desktop)', price:3999, img:'./images/wa06.png'},
  {id:'WA-07', title:'VanWyk DriveBench GUI', price:1800, img:'./images/wa07.png'},
  {id:'WA-08', title:'ECU/TCU Android GUI', price:999, img:'./images/wa08.png'},
  {id:'WA-09', title:'ECU/TCU Desktop GUI', price:1009, img:'./images/wa09.png'},
  {id:'WA-10', title:'Hybrid Gate Firmware', price:1299, img:'./images/wa10.png'},
  {id:'WA-11', title:'3D Printer GUI (Pre‑order)', price:5499, img:'./images/wa11.png'}
];

function money(n){return 'R '+Number(n).toLocaleString()}

async function boot(){
  qs('#buildId').textContent = state.buildId;
  let products = MOCK_PRODUCTS;
  if (!OFFLINE) {
    try { const res = await fetch(API_BASE + '/products'); products = (await res.json()).data; } catch(e){ console.warn('API products failed, using mock', e); }
  }
  renderProducts(products);
  loadPriceLog();
}

function renderProducts(items){
  const root = qs('#productGrid');
  root.innerHTML = '';
  items.forEach(p=>{
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <img src="${p.img || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 200 120\'><rect width=\'200\' height=\'120\' rx=\'12\' fill=\'%23e2e8f0\'/></svg>'}" alt="${p.title}" style="width:100%;height:140px;object-fit:cover;border-radius:12px;"/>
      <div class="title">${p.title}</div>
      <div class="muted">ID: ${p.id}</div>
      <div class="price">${money(p.price)}</div>
      <div style="margin-top:auto;display:flex;gap:8px;flex-wrap:wrap">
        <a class="btn" href="#">Details</a>
        <a class="btn" href="https://wa.me/27716816131?text=Hi%20Wykies%20Automation%20—%20I%27m%20interested%20in%20${encodeURIComponent(p.id+' '+p.title)}">Enquire</a>
      </div>
    `;
    root.appendChild(el);
  });
}

async function loadPriceLog(){
  const tb = qs('#gridPriceLog tbody');
  tb.innerHTML = '<tr><td colspan=5>Loading…</td></tr>';
  let rows = [];
  if (!OFFLINE) {
    try { const res = await fetch(API_BASE + '/price-changes'); rows = (await res.json()).data; } catch(e) { console.warn('API price log failed', e); }
  } else {
    rows = [
      {date:'2025-12-21', product_id:'WA-01', old:1399, new:1499, note:'Final VAT-inclusive price set'},
      {date:'2025-12-21', product_id:'WA-02', old:2399, new:2499, note:'Final VAT-inclusive price set'}
    ];
  }
  tb.innerHTML = '';
  rows.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.date}</td><td>${r.product_id}</td><td>${money(r.old)}</td><td>${money(r.new)}</td><td>${r.note||''}</td>`;
    tb.appendChild(tr);
  });
}

window.addEventListener('load', boot);

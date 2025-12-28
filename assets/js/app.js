// Wykies Automation public site — dynamic rendering via Google Sheets CSV
// Config
const SHEET_ID = "12qRMe6pAPVaQtosZBnhVtpMwyNks7W8uY9PX1mF620k"; // CMS Sheet
const PRODUCTS_SHEET = "Products";
const SETTINGS_SHEET = "Settings";
const PRICELOG_SHEET = "PriceLog";
const PRODUCTS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(PRODUCTS_SHEET)}`;
const SETTINGS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SETTINGS_SHEET)}`;
const PRICELOG_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(PRICELOG_SHEET)}`;

let CONTACT = { whatsappIntl: "27716816131", email: "wykiesautomation@gmail.com" };

// Helpers
function toRand(v){ return `R${Number(v).toFixed(2)}`; }
function qs(sel){ return document.querySelector(sel); }
function param(name){ return new URLSearchParams(location.search).get(name); }
function parseCSV(text){
  const rows=[]; let i=0,cell="",row=[],inQ=false;
  while(i<text.length){ const c=text[i++]; if(c=='"'){ inQ=!inQ; }
    else if(c==',' && !inQ){ row.push(cell); cell=''; }
    else if(c=='\n' && !inQ){ row.push(cell); rows.push(row); row=[]; cell=''; }
    else { cell+=c; }
  }
  if(cell.length||row.length){ row.push(cell); rows.push(row); }
  const headers = rows.shift().map(h=>h.trim());
  return rows.map(r=>{ const o={}; headers.forEach((h,idx)=>o[h]=(r[idx]||"").trim()); return o; });
}
async function fetchCSV(url, ms=8000){
  const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),ms);
  try{ const res=await fetch(url,{signal:ctrl.signal}); clearTimeout(timer); if(!res.ok) throw new Error(`HTTP ${res.status}`); return await res.text(); }
  catch(e){ clearTimeout(timer); console.warn('CSV fetch failed:', e.message); return null; }
}

// Loaders
async function loadSettings(){
  const csv = await fetchCSV(SETTINGS_URL); if(!csv) return;
  const rows = parseCSV(csv);
  rows.forEach(r=>{
    if(r.Key==='whatsapp') CONTACT.whatsappIntl = r.Value || CONTACT.whatsappIntl;
    if(r.Key==='email') CONTACT.email = r.Value || CONTACT.email;
    if(r.Key==='hero_title'){ const el=qs('#heroTitle'); if(el) el.textContent=r.Value; }
    if(r.Key==='hero_tagline'){ const el=qs('#heroTagline'); if(el) el.textContent=r.Value; }
  });
  const waUrl = `https://wa.me/${CONTACT.whatsappIntl}?text=${encodeURIComponent('Hello Wykies Automation — I am interested')}`;
  ['#navWhatsApp','#heroWhatsApp','#footerWhatsApp'].forEach(sel=>{ const el=qs(sel); if(el) el.setAttribute('href', waUrl); });
  const emailSel = qs('#footerEmail'); if(emailSel) emailSel.setAttribute('href', `mailto:${CONTACT.email}`);
}
async function loadProducts(){
  const csv = await fetchCSV(PRODUCTS_URL);
  const fallback = [
    {sku:'WA-01', name:'GSM Gate Controller', price:1499, summary:'Remote control via GSM/Wi‑Fi', image:'assets/img/products/wa-01.png', active:true, category:'Control Systems', stock:0},
    {sku:'WA-02', name:'Plasma Cutter Control', price:2499, summary:'THC & cut job management', image:'assets/img/products/wa-02.png', active:true, category:'Industrial', stock:0},
    {sku:'WA-03', name:'ECU/TCU Control System', price:6499, summary:'Automotive ECU/TCU GUI', image:'assets/img/products/wa-03.png', active:true, category:'Automotive', stock:0}
  ];
  if(!csv){ console.log('Using LOCAL fallback'); return fallback; }
  const rows = parseCSV(csv);
  return rows.map(r=>{
    const sku = r.SKU; const base = (sku||'').toLowerCase();
    const localPng = `assets/img/products/${base}.png`;
    const localWebp = `assets/img/products/${base}.webp`;
    const thumbPng = `assets/img/products/${base}-thumb.png`;
    const thumbWebp = `assets/img/products/${base}-thumb.webp`;
    const img = r.ImageURL || localPng;
    const active = String(r.Active||'').toLowerCase()==='true';
    const stock = Number(r.Stock||0);
    const summary = r.Summary || r.Name || sku;
    return { sku, name:r.Name, price:Number(r.PriceZAR||0), summary, image:img, localPng, localWebp, thumbPng, thumbWebp, active, category:r.Category||'Product', stock };
  });
}
async function loadPriceLog(){
  const csv = await fetchCSV(PRICELOG_URL); if(!csv) return [];
  const rows = parseCSV(csv);
  return rows.map(r=>({ sku:r.SKU, date:r.Date, price:r.PriceZAR, note:r.Note }));
}

// Renderers
function pictureHTML(p, alt, useThumb=false){
  const png = useThumb ? p.thumbPng : p.localPng;
  const webp = useThumb ? p.thumbWebp : p.localWebp;
  if((useThumb?p.thumbWebp:p.localWebp)){
    return `<picture>\n <source srcset="${webp}" type="image/webp">\n <img src="${png}" alt="${alt}" loading="lazy">\n</picture>`;
  } else {
    return `<img src="${p.image}" alt="${alt}" loading="lazy">`;
  }
}
function renderProductCards(products){
  const grid=document.getElementById('productGrid'); if(!grid) return;
  grid.innerHTML = products.filter(p=>p.active).map(p=>`
    <article class="card">
      ${pictureHTML(p, p.name, true)}
      <div class="body">
        <h3>${p.name}</h3>
        <p class="muted">${p.summary||''}</p>
        <div class="row">
          <span class="price">${toRand(p.price)}</span>
          ${p.stock>0 ? `<span class="badge ok">In Stock</span>` : `<span class="badge warn">Pre‑Order</span>`}
        </div>
        <div class="row" style="margin-top:8px;">
          <a class="btn" href="/products/product.html?sku=${encodeURIComponent(p.sku)}">View Details</a>
          <a class="btn btn-outline" target="_blank" rel="noopener" href="/docs/${encodeURIComponent(p.sku)}.pdf">View Docs</a>
        </div>
      </div>
    </article>`).join('');
}
function renderGalleryPreview(products){
  const grid=document.getElementById('galleryPreview'); if(!grid) return;
  const items=[]; products.forEach(p=>{ items.push({p, src:p.thumbPng, alt:p.name}); });
  grid.innerHTML = items.slice(0,8).map(g=>`
    <figure class="card">
      ${pictureHTML(g.p, g.alt, true)}
      <figcaption class="body">${g.alt}</figcaption>
    </figure>`).join('');
}
async function renderProductPage(products){
  const el=document.getElementById('product'); if(!el) return; const sku=param('sku');
  const p=products.find(x=>x.sku===sku) || products[0];
  const waUrl = `https://wa.me/${CONTACT.whatsappIntl}?text=${encodeURIComponent(`Hi, I'm interested in ${p.sku} — ${p.name}`)}`;
  const hero = pictureHTML(p, p.name, false);
  el.innerHTML = `
    <section class="product-wrap">
      <div>
        ${hero}
        <div class="product-gallery" style="margin-top:12px;">
          ${[p.thumbPng,p.thumbWebp].filter(Boolean).map(src=>`<img src="${src}" alt="${p.name} gallery" loading="lazy">`).join('')}
        </div>
      </div>
      <div>
        <h2>${p.sku} — ${p.name}</h2>
        <p class="badge">${p.category||'Product'}</p>
        <p>${p.summary||''}</p>
        <p><strong class="price">${toRand(p.price)}</strong> (VAT incl.)</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <a class="btn" target="_blank" rel="noopener" href="${waUrl}">WhatsApp</a>
          <a class="btn btn-outline" href="/docs/${encodeURIComponent(p.sku)}.pdf">View Docs</a>
          <form action="https://www.payfast.co.za/eng/process" method="post" style="display:inline;">
            <input type="hidden" name="merchant_id" value="32913011" />
            <input type="hidden" name="merchant_key" value="8wd7iwcgippud" />
            <input type="hidden" name="amount" value="${Number(p.price).toFixed(2)}" />
            <input type="hidden" name="item_name" value="${p.sku} — ${p.name}" />
            <input type="hidden" name="item_description" value="${(p.summary||p.name)}" />
            <input type="hidden" name="return_url" value="https://wykiesautomation.co.za/thanks.html" />
            <input type="hidden" name="cancel_url" value="https://wykiesautomation.co.za/cancel.html" />
            <input type="hidden" name="notify_url" value="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=itn" />
            <button type="submit" class="btn">Buy</button>
          </form>
        </div>
      </div>
    </section>`;

  // Price Log
  const logTable = document.getElementById('priceLog'); if(logTable){
    const logs = await loadPriceLog();
    const rows = logs.filter(x=>x.sku===p.sku);
    if(rows.length){
      const html = '<thead><tr><th>Date</th><th>Price</th><th>Note</th></tr></thead>'+
        '<tbody>'+rows.map(r=>`<tr><td>${r.date}</td><td>${toRand(r.price)}</td><td>${r.note||''}</td></tr>`).join('')+'</tbody>';
      logTable.innerHTML = html;
    } else {
      logTable.innerHTML = '<tbody><tr><td colspan="3">No entries yet.</td></tr></tbody>';
    }
  }
}

function wireNav(){
  const waUrl = `https://wa.me/${CONTACT.whatsappIntl}?text=${encodeURIComponent('Hello Wykies Automation — I am interested')}`;
  const navWA=document.getElementById('navWhatsApp'); if(navWA) navWA.setAttribute('href', waUrl);
}

(async function init(){
  wireNav();
  await loadSettings();
  const products = await loadProducts();
  renderProductCards(products);
  renderGalleryPreview(products);
  renderProductPage(products);
})();

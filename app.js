/* Wykies Automation: Public site data loader (Sheet + Drive + local fallback) */
const SHEET_ID = "12qRMe6pAPVaQtosZBnhVtpMwyNks7W8uY9PX1mF620k"; // CMS Sheet
const PRODUCTS_SHEET = "Products";
const SETTINGS_SHEET = "Settings";
const PRODUCTS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(PRODUCTS_SHEET)}`;
const SETTINGS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SETTINGS_SHEET)}`;
let CONTACT = { whatsappIntl: "27716816131", email: "wykiesautomation@gmail.com" };
const LOCAL_SAMPLE = [
  {sku:"WA-01", name:"3D Printer Control V1", price:1499, summary:"Desktop control UI", image:"assets/img/wa-01.png", active:true, category:"Control Systems", gallery:[]},
  {sku:"WA-02", name:"Plasma Cutter Control V1", price:2499, summary:"Plasma cut control", image:"assets/img/wa-02.png", active:true, category:"Industrial", gallery:[]},
  {sku:"WA-03", name:"ECU/TCU Control System V1", price:6499, summary:"Vehicle ECU/TCU", image:"assets/img/wa-03.png", active:true, category:"Automotive", gallery:[]}
];
const driveView = id => `https://drive.google.com/uc?export=view&id=${id}`;
function toRand(v){ return `R${Number(v).toFixed(2)}`; }
function qs(sel){ return document.querySelector(sel); }
function param(name){ return new URLSearchParams(location.search).get(name); }

function parseCSV(text){
  const rows=[]; let i=0,cell="",row=[],inQ=false;
  while(i<text.length){ const c=text[i++]; if(c==='"'){ inQ=!inQ; }
    else if(c===',' && !inQ){ row.push(cell); cell=''; }
    else if(c==='
' && !inQ){ row.push(cell); rows.push(row); row=[]; cell=''; }
    else { cell+=c; } }
  if(cell.length||row.length){ row.push(cell); rows.push(row); }
  const headers = rows.shift().map(h=>h.trim());
  return rows.map(r=>{ const o={}; headers.forEach((h,idx)=>o[h]=(r[idx]||"").trim()); return o; });
}
async function fetchCSV(url, ms=8000){
  const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),ms);
  try{ const res=await fetch(url,{signal:ctrl.signal}); clearTimeout(timer); if(!res.ok) throw new Error(`HTTP ${res.status}`); return await res.text(); }
  catch(e){ clearTimeout(timer); console.warn('CSV fetch failed:', e.message); return null; }
}
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
  if(!csv){ console.log('Using LOCAL_SAMPLE fallback'); return LOCAL_SAMPLE; }
  const rows = parseCSV(csv);
  return rows.map(r=>{
    const sku = r.SKU; const base = (sku||'').toLowerCase();
    const localPng = `assets/img/${base}.png`; const localWebp = `assets/img/${base}.webp`;
    const img = r.ImageURL || (r.ImageDriveID ? driveView(r.ImageDriveID) : localPng);
    const gal = (r.GalleryDriveIDs||"").split(/[,|]/).map(x=>x.trim()).filter(Boolean).map(driveView);
    const active = String(r.Active||'').toLowerCase()==='true';
    return { sku, name:r.Name, price:Number(r.PriceZAR||0), summary:r.Summary, image:img, localPng, localWebp, active, category:r.Category, gallery:gal, stock:Number(r.Stock||0) };
  });
}
function pictureHTML(p, alt){
  // If image is local (assets/), offer webp+png; otherwise use single img
  if(p.image && p.image.startsWith('assets/')){
    const baseWebp = p.localWebp || p.image.replace('.png','.webp');
    return `<picture>
  <source srcset="${baseWebp}" type="image/webp">
  <img src="${p.localPng||p.image}" alt="${alt}" loading="lazy">
</picture>`;
  } else {
    return `<img src="${p.image}" alt="${alt}" loading="lazy">`;
  }
}
function renderProductCards(products){
  const grid=document.getElementById('productGrid'); if(!grid) return;
  grid.innerHTML = products.filter(p=>p.active).map(p=>`
    <article class="card">
      ${pictureHTML(p, p.name)}
      <div class="body">
        <h3>${p.name}</h3>
        <p class="muted">${p.summary||''}</p>
        <div class="row">
          <span class="price">${toRand(p.price)}</span>
          ${p.stock>0 ? `<span class="badge ok">In Stock</span>` : `<span class="badge warn">Pre‑Order</span>`}
        </div>
        <div class="row" style="margin-top:8px;">
          <a class="btn" href="product.html?sku=${encodeURIComponent(p.sku)}">View Details</a>
          <a class="btn secondary" target="_blank" rel="noopener" href="docs/${encodeURIComponent(p.sku)}.pdf">View Docs</a>
        </div>
      </div>
    </article>`).join('');
}
function renderGalleryPreview(products){
  const grid=document.getElementById('galleryPreview'); if(!grid) return;
  const items=[]; products.forEach(p=>{ if(p.image) items.push({p, src:p.image, alt:p.name}); (p.gallery||[]).forEach(src=> items.push({p, src, alt:`${p.sku} gallery`})); });
  grid.innerHTML = items.slice(0,6).map(g=>`
    <figure class="card">
      ${g.src.startsWith('assets/') ? `<picture><source srcset="${g.p.localWebp}" type="image/webp"><img src="${g.p.localPng}" alt="${g.alt}" loading="lazy"></picture>` : `<img src="${g.src}" alt="${g.alt}" loading="lazy">`}
      <figcaption class="body">${g.alt}</figcaption>
    </figure>`).join('');
}
function renderProductPage(products){
  const el=document.getElementById('product'); if(!el) return; const sku=param('sku'); const p=products.find(x=>x.sku===sku)||products[0];
  const galleryHtml=(p.gallery||[]).map(src=>`<img src="${src}" alt="${p.name} gallery" loading="lazy">`).join('');
  const waUrl = `https://wa.me/${CONTACT.whatsappIntl}?text=${encodeURIComponent(`Hi, I'm interested in ${p.sku} — ${p.name}`)}`;
  el.innerHTML = `
    <section class="product-wrap">
      <div>
        ${pictureHTML({...p, image:p.localPng||p.image}, p.name)}
        <div class="product-gallery" style="margin-top:12px;">${galleryHtml||''}</div>
      </div>
      <div>
        <h2>${p.sku} — ${p.name}</h2>
        <p class="badge">${p.category||'Product'}</p>
        <p>${p.summary||''}</p>
        <p><strong class="price">${toRand(p.price)}</strong> (VAT incl.)</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <a class="btn" target="_blank" rel="noopener" href="${waUrl}">WhatsApp</a>
          <a class="btn secondary" href="docs/${encodeURIComponent(p.sku)}.pdf">View Docs</a>
          <form action="https://www.payfast.co.za/eng/process" method="post" style="display:inline;">
            <input type="hidden" name="amount" value="${Number(p.price).toFixed(2)}" />
            <input type="hidden" name="item_name" value="${p.sku} — ${p.name}" />
            <input type="hidden" name="item_description" value="${p.summary||p.name}" />
            <button type="submit" class="btn">Buy</button>
          </form>
        </div>
      </div>
    </section>`;
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

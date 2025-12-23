
async function loadJSON(url){ const res = await fetch(url); return await res.json(); }
async function loadConfig(){ return await loadJSON('config.json'); }
async function loadCMS(){ return await loadJSON('cms.json'); }
function formatPriceZAR(amount){ if(amount==null) return '—'; return 'R' + amount.toLocaleString('en-ZA',{minimumFractionDigits:0}); }
function whatsappLink(number,text){ return `https://wa.me/${number}?text=${encodeURIComponent(text)}`; }
function mailtoLink(email,subject){ return `mailto:${email}?subject=${encodeURIComponent(subject)}`; }

function toSlug(sku){ return String(sku||'').toLowerCase().replace(/\s+/g,'').replace(/-/g,''); }
function fromSlug(slug, products){ const s = String(slug||'').toLowerCase(); return products.find(p => toSlug(p.sku) === s); }

async function renderIndex(){
  const cfg = await loadConfig(); const cms = await loadCMS();
  document.querySelector('#brandLogo').src = cfg.brandLogo;
  const grid = document.querySelector('#products'); grid.innerHTML='';
  cms.products.filter(p=>p.active!==false).forEach(p=>{
    const card = document.createElement('div'); card.className='card';
    const img = document.createElement('img'); img.alt=p.name; img.src=p.imageUrl||'assets/img/placeholder.png';
    const content = document.createElement('div'); content.className='content';
    const h3 = document.createElement('h3'); h3.textContent=p.name;
    const summary = document.createElement('p'); summary.textContent=p.summary;
    const price = document.createElement('div'); price.className='price'; price.textContent=formatPriceZAR(p.price);
    const btns = document.createElement('div'); btns.className='btns';
    const viewBtn = document.createElement('a'); viewBtn.className='btn primary'; viewBtn.href=`product.html?sku=${toSlug(p.sku)}`; viewBtn.textContent='View';
    const emailBtn = document.createElement('a'); emailBtn.className='btn'; emailBtn.href=mailtoLink(cfg.adminEmail,`[${p.sku}] Enquiry`); emailBtn.textContent='Email';
    const waBtn = document.createElement('a'); waBtn.className='btn'; waBtn.href=whatsappLink(cfg.whatsappNumber,`Hi, I am interested in ${p.name} (${p.sku}).`); waBtn.textContent='WhatsApp';
    btns.append(viewBtn,emailBtn,waBtn);
    content.append(h3,summary,price);
    card.append(img,content,btns);
    grid.append(card);
  });
}

async function renderProduct(){
  const cfg = await loadConfig(); const cms = await loadCMS();
  document.querySelector('#brandLogo').src = cfg.brandLogo;
  const url = new URL(window.location.href);
  const q = url.searchParams.get('sku');
  const p = fromSlug(q,cms.products) || cms.products.find(x=>x.sku===q) || cms.products[0];
  if(!p){ document.querySelector('#product').innerHTML='<p>Product not found.</p>'; return; }
  document.querySelector('#pName').textContent=p.name;
  document.querySelector('#pPrice').textContent=formatPriceZAR(p.price);
  document.querySelector('#pImg').src=p.imageUrl||'assets/img/placeholder.png';
  document.querySelector('#pImg').alt=p.name;
  document.querySelector('#pDesc').textContent=p.description||p.summary;
  document.querySelector('#btnEmail').href=mailtoLink(cfg.adminEmail,`[${p.sku}] Enquiry`);
  document.querySelector('#btnWA').href=whatsappLink(cfg.whatsappNumber,`Hi, I am interested in ${p.name} (${p.sku}).`);
  if(p.trialUrl){ const t=document.querySelector('#btnTrial'); t.href=p.trialUrl; t.style.display='inline-block'; }
  if(p.docUrl){ const d=document.querySelector('#btnDoc'); d.href=p.docUrl; d.style.display='inline-block'; }
}

async function renderGallery(){
  const cfg = await loadConfig(); const cms = await loadCMS();
  document.querySelector('#brandLogo').src = cfg.brandLogo;
  const grid = document.querySelector('#gallery'); grid.innerHTML='';
  cms.gallery.forEach(g=>{ const item=document.createElement('div'); const img=document.createElement('img'); img.src=g.url||'assets/img/placeholder.png'; img.alt=g.caption||'Image'; const cap=document.createElement('div'); cap.textContent=g.caption||''; item.append(img,cap); grid.append(item); });
}


const fmtZAR = v => new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(v);
const state = { products: [], filtered: [] };
async function loadJSON(path){ const r = await fetch(path); return r.json(); }
function waLink(p){ const msg = `Hi Wykies Automation, I'm interested in ${p.sku} (${p.name}) priced at ${fmtZAR(p.price)}. Can you help me order?`; return 'https://wa.me/27716816131?text=' + encodeURIComponent(msg); }
function productCard(p){ const el=document.createElement('article'); el.className='card'; el.innerHTML=`<img src="${p.imageUrl||'./assets/img/products/wa-01.png'}" alt="${p.name}" loading="lazy">
<div class='pad'>
<h3>${p.name}</h3>
<div class='price'><span class='cur'>ZAR</span>${fmtZAR(p.price)}</div>
<p class='muted'>SKU: ${p.sku}</p>
<p class='muted'>${p.summary||''}</p>
<div class='cta'>
<a class='btn primary' href='./product.html?sku=${encodeURIComponent(p.sku)}'>View</a>
<button class='btn outline' data-buy='${p.sku}'>Buy</button>
<a class='btn whats' href='${waLink(p)}' target='_blank'>WhatsApp</a>
</div></div>`; return el; }
function filterProducts(q){ q=(q||'').toLowerCase(); state.filtered=!q?state.products:state.products.filter(p=> (p.name||'').toLowerCase().includes(q)||(p.summary||'').toLowerCase().includes(q)||(p.sku||'').toLowerCase().includes(q)); }
function renderGrid(sel,list){ const grid=document.getElementById(sel); if(!grid) return; grid.innerHTML=''; list.forEach(p=>grid.appendChild(productCard(p))); grid.addEventListener('click',(e)=>{ const btn=e.target.closest('button[data-buy]'); if(btn){ startCheckout(btn.getAttribute('data-buy')); } }); }
async function renderHome(){ const products=await loadJSON('./assets/js/products.json'); state.products=products; filterProducts(''); renderGrid('product-grid', state.filtered.slice(0,6)); const pl=document.querySelector('#price-log-table tbody'); if(pl){ const log=await loadJSON('./assets/js/price-log.json'); if(!log.length){ pl.innerHTML = `<tr><td colspan='4' class='muted'>No recent changes.</td></tr>`; } log.forEach(r=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${r.sku}</td><td>${fmtZAR(r.oldPrice)} → ${fmtZAR(r.newPrice)}</td><td>${new Date(r.timestamp).toLocaleString()}</td><td>${r.note||''}</td>`; pl.appendChild(tr); }); } const gg=document.getElementById('gallery-grid'); if(gg){ fetch('./assets/img/gallery/gallery.json').then(r=>r.json()).then(list=>{ list.slice(0,6).forEach(s=>{ const a=document.createElement('a'); a.href=s.src; a.target='_blank'; const img=document.createElement('img'); img.loading='lazy'; img.src=s.src; img.alt=s.alt||''; a.appendChild(img); gg.appendChild(a); }); }); } const s=document.getElementById('search'); if(s){ s.addEventListener('input', ()=>{ filterProducts(s.value); renderGrid('product-grid', state.filtered.slice(0,6)); }); } const hamb=document.getElementById('hamburger'); const nav=document.getElementById('nav'); if(hamb){ hamb.addEventListener('click', ()=>{ nav.style.display = nav.style.display==='block' ? 'none' : 'block'; }); } const contact=document.getElementById('contact-form'); if(contact){ contact.addEventListener('submit', ()=>{ const status=document.getElementById('contact-status'); status.textContent='Sending…'; setTimeout(()=>{ status.textContent='Thanks! We will reply by email/WhatsApp.'; }, 1200); }); } }
async function renderProducts(){ const gridId='all-products-grid'; const grid=document.getElementById(gridId); if(!grid) return; const products=await loadJSON('./assets/js/products.json'); state.products=products; filterProducts(''); renderGrid(gridId, state.filtered); const s=document.getElementById('search'); if(s){ s.addEventListener('input', ()=>{ filterProducts(s.value); renderGrid(gridId, state.filtered); }); } }
async function renderProductDetail(){ const holder=document.getElementById('product-detail'); if(!holder) return; const sku=new URL(location.href).searchParams.get('sku'); const products=await loadJSON('./assets/js/products.json'); const p=products.find(x=>x.sku===sku)||products[0]; holder.innerHTML = `
<div class='grid' style='grid-template-columns:repeat(auto-fit,minmax(300px,1fr))'>
  <div><img src='${p.imageUrl||'./assets/img/products/wa-01.png'}' alt='${p.name}' style='width:100%;height:auto;border-radius:.7rem;border:1px solid #1f2937' loading='lazy'/></div>
  <div>
    <h1>${p.name}</h1>
    <div class='price'><span class='cur'>ZAR</span>${fmtZAR(p.price)}</div>
    <p class='muted'>SKU: ${p.sku}</p>
    <p>${(p.description||'').replace(/
/g,'<br/>')}</p>
    <div class='cta'>
      <button class='btn primary' id='buy-btn'>Buy with PayFast</button>
      ${p.docUrl?`<a class='btn outline' href='${p.docUrl}' target='_blank'>Docs</a>`:''}
      ${p.trialUrl?`<a class='btn outline' href='${p.trialUrl}' target='_blank'>Download Trial</a>`:''}
      <a class='btn whats' href='${waLink(p)}' target='_blank'>WhatsApp</a>
    </div>
  </div>
</div>`; document.getElementById('buy-btn').addEventListener('click',()=>startCheckout(p.sku)); }
function startCheckout(sku){ const url = `https://api.wykiesautomation.co.za/checkout?sku=${encodeURIComponent(sku)}`; location.href = url; }
renderHome(); renderProducts(); renderProductDetail();

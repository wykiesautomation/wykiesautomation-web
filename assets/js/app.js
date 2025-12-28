
/* Wykies Automation — Public Pages JS with Enquiry modal */
const WA = (function(){
  const cfg = () => (window.WA_BOOT || { apiBase: "", sheetId: "" });
  const qs = (s,el=document)=>el.querySelector(s); const qsa=(s,el=document)=>[...el.querySelectorAll(s)];
  const money = n => "R" + Number(n).toLocaleString("en-ZA",{minimumFractionDigits:0});

  async function fetchJSON(kind, params={}){
    if(!cfg().apiBase){ return demo(kind); }
    const url = new URL(cfg().apiBase);
    url.search = new URLSearchParams({ kind, ...params, sheetId: cfg().sheetId }).toString();
    const res = await fetch(url.toString(), { cache:'no-store' });
    if(!res.ok) throw new Error('HTTP '+res.status);
    return res.json();
  }

  function renderProducts(list, grid){
    grid.innerHTML = list.map(p=>`
      <article class="card" data-sku="${p.sku}" data-name="${p.name}" data-summary="${p.summary}">
        <div class="media"><img src="${p.imageUrl}" alt="${p.name} product image" loading="lazy" width="800" height="600"></div>
        <div class="body">
          <div class="price-badge">${money(p.price)}</div>
          <div class="title">${p.name}</div>
          <div class="summary">${p.summary||''}</div>
          <div class="cta-row" style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
            <a class="btn btn-primary" href="products/product.html?sku=${encodeURIComponent(p.sku)}">Details</a>
            <a class="btn btn-outline" href="${p.docUrl||'docs/'}">Docs</a>
            <a class="btn btn-whatsapp" href="https://wa.me/27716816131?text=${encodeURIComponent('Hi, I'm interested in '+p.sku+' — '+p.name)}">WhatsApp</a>
            <button class="btn btn-secondary btn-enquire" data-sku="${p.sku}" data-name="${p.name}">Enquire</button>
          </div>
        </div>
      </article>`).join('');
    grid.querySelectorAll('.btn-enquire').forEach(b=> b.addEventListener('click', e=> openEnquiryModal(e.currentTarget.dataset)) );
  }

  function renderGallery(list, grid){ grid.innerHTML = list.map(g=>`
    <figure class="thumbs" data-caption="${g.caption||''}" data-sku="${g.sku||''}">
      <img src="${g.thumbUrl}" alt="${g.caption||g.sku||'Gallery image'}" loading="lazy" width="600" height="400">
    </figure>`).join(''); }

  async function initHome(){
    const pGrid = qs('#productsGrid'); const gGrid = qs('#galleryGrid'); const search = qs('#searchInput');
    const { products=[] } = await fetchJSON('products'); const { gallery=[] } = await fetchJSON('gallery');
    renderProducts(products.slice(0,6), pGrid); renderGallery(gallery.slice(0,6), gGrid);
    search?.addEventListener('input', e=>{ const q=e.target.value.toLowerCase(); const f=products.filter(p=>[p.name,p.summary,p.sku].join(' ').toLowerCase().includes(q)); renderProducts(f.slice(0,9), pGrid); });
  }

  async function initGallery(){ const grid=qs('#galleryGrid'); const search=qs('#gallerySearch'); const { gallery=[] } = await fetchJSON('gallery'); renderGallery(gallery, grid); search?.addEventListener('input', e=>{ const q=e.target.value.toLowerCase(); qsa('figure', grid).forEach(fig=>{ const hay=(fig.dataset.caption+" "+fig.dataset.sku).toLowerCase(); fig.style.display = hay.includes(q)? '' : 'none'; }); }); }

  async function initProduct({ defaultSku }={}){
    const params=new URLSearchParams(location.search); const sku=params.get('sku')||defaultSku||'WA-01';
    const bc = qs('#productBreadcrumb'); bc.innerHTML = `<a href="../index.html">Home</a> / <a href="./product.html">Products</a> / <span>${sku}</span>`;
    const { products=[] } = await fetchJSON('products'); const item = products.find(p=>p.sku===sku) || products[0]; if(!item) return;
    qs('#productImage').src=item.imageUrl; qs('#productImage').alt=`${item.name} product image`; qs('#productName').textContent=item.name; qs('#productSku').textContent=`SKU • ${item.sku}`; qs('#productPrice').textContent=money(item.price); qs('#productSummary').textContent=item.summary||''; qs('#productDescription').innerHTML=(item.description||'').replace(/
/g,'<br>');
    qs('#buyBtn').href = `../checkout/payfast.html?sku=${encodeURIComponent(item.sku)}`; const t=qs('#trialBtn'); t.href=item.trialUrl||'#'; t.style.display=item.trialUrl?'':'none'; const d=qs('#docsBtn'); d.href=item.docUrl||'../docs/';
    const eq=qs('#enquireBtn'); if(eq){ eq.addEventListener('click', ()=> openEnquiryModal({ sku:item.sku, name:item.name }) ); }
    const { priceLog=[] } = await fetchJSON('priceLog', { sku:item.sku }); const tb=qs('#priceLog tbody'); tb.innerHTML = priceLog.map(r=>`<tr><td>${r.timestamp}</td><td>${money(r.oldPrice)}</td><td>${money(r.newPrice)}</td><td>${r.changedBy||'admin'}</td></tr>`).join('');
  }

  // Enquiry Modal + API
  const ENQUIRY_ENDPOINT = ""; // paste your Apps Script Web App URL
  function openEnquiryModal({ sku, name }){ const m=qs('#enquiryModal'); qs('#enquiryTitle').textContent=`Enquire about ${sku} — ${name}`; qs('#enquirySku').value=sku; qs('#enquiryForm').reset(); qs('#enquiryStatus').textContent=''; m.hidden=false; m.querySelector('.modal-close').onclick=()=> m.hidden=true; m.addEventListener('click',ev=>{ if(ev.target===m) m.hidden=true; },{ once:true }); }
  (function wireEnquiry(){ const f=qs('#enquiryForm'); if(!f) return; f.addEventListener('submit', async (e)=>{ e.preventDefault(); const st=qs('#enquiryStatus'); const sku=qs('#enquirySku').value.trim(); const name=qs('#enquiryName').value.trim(); const email=qs('#enquiryEmail').value.trim(); const message=qs('#enquiryMsg').value.trim(); const productName=(qs('#enquiryTitle').textContent||'').split('—').slice(1).join('—').trim(); st.textContent='Sending…'; try{ const res=await fetch(ENQUIRY_ENDPOINT,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ type:'enquiry', sku, productName, name, email, message })}); const j=await res.json(); st.textContent = j.ok? 'Thanks — your enquiry has been sent!' : 'Could not send (try again).'; if(j.ok) setTimeout(()=> qs('#enquiryModal').hidden=true, 800); }catch(err){ st.textContent='Network error (try again).'; } }); })();

  function demo(kind){ // local preview data
    const products = [
      ['WA-01','3D Printer Control V1',1499,'Desktop control app + firmware','assets/img/wa-01.png'],
      ['WA-02','Plasma Cutter Control V1',2499,'CNC plasma controller UI','assets/img/wa-02.png'],
      ['WA-03','ECU/TCU Control System V1',6499,'Vehicle ECU/TCU toolkit','assets/img/wa-03.png'],
      ['WA-04','Fridge/Freezer Control V1',899,'Temp control module','assets/img/wa-04.png'],
      ['WA-05','Nano GSM Gate Controller V1',800,'GSM gate opener','assets/img/wa-05.png'],
      ['WA-06','Solar Energy Management V1',3999,'PV/ESS monitor','assets/img/wa-06.png'],
      ['WA-07','Hybrid Gate Controller V1',1800,'Wi‑Fi+GSM gate','assets/img/wa-07.png'],
      ['WA-08','Smart Battery Charger V1',999,'Smart charger','assets/img/wa-08.png'],
      ['WA-09','Gate/Garage Controller V1',1009,'Garage opener','assets/img/wa-09.png'],
      ['WA-10','12CH Hybrid Alarm V1',1299,'Hybrid alarm 12ch','assets/img/wa-10.png'],
      ['WA-11','16CH Hybrid Alarm V1',5499,'Hybrid alarm 16ch','assets/img/wa-11.png'],
      ['WA-12','TCU Gearbox Controller V1',4500,'Standalone TCU','assets/img/wa-12.png']
    ].map(([sku,name,price,summary,imageUrl])=>({ sku,name,price,summary,imageUrl, description:'Markdown description', trialUrl:'', docUrl:'docs/' }));
    if(kind==='products') return Promise.resolve({ products });
    if(kind==='gallery'){
      const gallery = Array.from({length:12}).map((_,i)=>({ sku: products[i%products.length].sku, caption: products[i%products.length].name, thumbUrl: `assets/img/thumbs/gallery-${String(i+1).padStart(2,'0')}.png` }));
      return Promise.resolve({ gallery });
    }
    if(kind==='priceLog'){
      return Promise.resolve({ priceLog:[{ timestamp:new Date().toISOString(), oldPrice:0, newPrice: products[0].price, changedBy:'admin' }]});
    }
    return Promise.resolve({});
  }

  return { initHome, initGallery, initProduct };
})();

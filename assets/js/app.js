(function(){
const yearEl=document.getElementById('year'); if(yearEl) yearEl.textContent=new Date().getFullYear();
fetch('config.json').then(r=>r.json()).then(cfg=>{
  const waBtn=document.getElementById('whatsappBtn');
  if(waBtn){ waBtn.href=`https://wa.me/${cfg.whatsappNumber.replace('+','')}` }
  const root=document.getElementById('products');
  const fromApi=fetch(`${cfg.appScriptUrl}?op=products`).then(r=>r.json()).catch(()=>null);
  const fromLocal=fetch('assets/data/products.json').then(r=>r.json());
  Promise.allSettled([fromApi,fromLocal]).then(([apiRes,localRes])=>{
    const data=(apiRes.status==='fulfilled' && apiRes.value && apiRes.value.products)? apiRes.value.products : localRes.value.products;
    data.filter(p=>p.active).forEach(p=>{
      const card=document.createElement('div');card.className='card';
      const img=document.createElement('img');img.src=p.imageUrl||(`assets/img/wa-${(p.sku||'').split('-')[1]}.png`);
      const body=document.createElement('div');body.className='body';
      const priceIntl=new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(p.price);
      body.innerHTML=`<div class="price">${priceIntl} <span class="badge">VAT incl.</span></div><h3>${p.name}</h3><p>${p.summary||''}</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <a class="btn brand" href="product.html?sku=${encodeURIComponent(p.sku)}">View</a>
        ${p.docUrl?`<a class='btn' href='${p.docUrl}' target='_blank'>Docs</a>`:''}
        ${p.trialUrl?`<a class='btn' href='${p.trialUrl}' target='_blank'>Trial</a>`:''}
        <a class="btn" href="https://wa.me/${cfg.whatsappNumber.replace('+','')}?text=${encodeURIComponent('Hi, I am interested in '+p.sku+' '+p.name)}" target="_blank">WhatsApp</a>
      </div>`;
      card.append(img,body);root.append(card);
    })
  })
})})();
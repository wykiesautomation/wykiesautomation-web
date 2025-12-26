(function(){
const params=new URLSearchParams(location.search); const sku=params.get('sku');
const yearEl=document.getElementById('year'); if(yearEl) yearEl.textContent=new Date().getFullYear();
Promise.all([fetch('config.json').then(r=>r.json()), fetch('assets/data/products.json').then(r=>r.json())]).then(([cfg, local])=>{
  const all=local.products; const p=all.find(x=>x.sku===sku) || all[0];
  const root=document.getElementById('product');
  const card=document.createElement('div'); card.className='card';
  const img=document.createElement('img'); img.src=p.imageUrl||(`assets/img/wa-${(p.sku||'').split('-')[1]}.png`);
  const body=document.createElement('div'); body.className='body';
  const priceIntl=new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(p.price);
  body.innerHTML=`<h2>${p.name}</h2><div class='price'>${priceIntl} <span class='badge'>VAT incl.</span></div><p>${p.summary||''}</p><p>${p.description||''}</p>
  <div style='display:flex;gap:8px;flex-wrap:wrap'>
    <button class='btn brand' id='buyBtn'>Buy with PayFast</button>
    ${p.docUrl?`<a class='btn' href='${p.docUrl}' target='_blank'>Docs</a>`:''}
    ${p.trialUrl?`<a class='btn' href='${p.trialUrl}' target='_blank'>Trial</a>`:''}
    <a class='btn' href='https://wa.me/${cfg.whatsappNumber.replace('+','')}?text=${encodeURIComponent('Hi, I want to buy '+p.sku+' '+p.name)}' target='_blank'>WhatsApp</a>
  </div>`;
  card.append(img,body); root.append(card);
  document.getElementById('buyBtn').addEventListener('click',()=>{
    const email=prompt('Enter your email for the invoice and receipt:'); if(!email) return;
    fetch(`${cfg.appScriptUrl}?op=createPayment&sku=${encodeURIComponent(p.sku)}&email=${encodeURIComponent(email)}&env=${cfg.env}`)
      .then(r=>r.json()).then(res=>{
        const url=(cfg.env==='live')?cfg.payfast.process_live:cfg.payfast.process_sandbox;
        const form=document.createElement('form'); form.method='POST'; form.action=url;
        for(const [k,v] of Object.entries(res.fields||{})){
          const inp=document.createElement('input'); inp.type='hidden'; inp.name=k; inp.value=v; form.appendChild(inp);
        }
        document.body.appendChild(form); form.submit();
      }).catch(err=>alert('Could not start PayFast checkout. Please try again.'));
  });
});
})();
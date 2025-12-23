
async function loadConfig(){ const r = await fetch('config.json'); return await r.json(); }
async function fetchProducts(){
  // Try Apps Script first
  try{ const cfg = await loadConfig(); const r = await fetch(cfg.appsScriptUrl + '?action=products'); if(r.ok){ const data = await r.json(); if(Array.isArray(data) && data.length) return data; } }catch(e){}
  // Fallback to local JSON
  const r2 = await fetch('data/products.json'); return await r2.json();
}
function formatPrice(v){ return 'R' + Number(v).toLocaleString('en-ZA'); }
function productCard(p){
  const trialBtn = p.trialUrl? `<a class="btn secondary" href="${p.trialUrl}" target="_blank">Trial (.exe)</a>`:'';
  const docBtn   = p.docUrl?   `<a class="btn secondary" href="${p.docUrl}" target="_blank">Documentation</a>`:'';
  return `<div class=card><img src='${p.imageUrl}' alt='${p.name}'><h3>${p.name}</h3><div class=price>${formatPrice(p.price)}</div><p>${p.summary}</p><div class=btns><a class=btn href='product.html?sku=${encodeURIComponent(p.sku)}'>View</a><button class="btn accent" onclick="payfastCheckout('${p.sku}')">Buy via PayFast</button>${trialBtn} ${docBtn}<button class="btn secondary" onclick="openEmail('${p.sku}')">Email</button><button class="btn secondary" onclick="openWhatsApp('${p.sku}')">WhatsApp</button></div></div>`;
}
function openEmail(sku){ const mail='wykiesautomation@gmail.com'; const subject=encodeURIComponent('Product enquiry: '+sku); const body=encodeURIComponent('Hi Wykies Automation,

I would like to know more about '+sku+'.

Regards'); window.location.href=`mailto:${mail}?subject=${subject}&body=${body}`; }
async function openWhatsApp(sku){ const cfg = await loadConfig(); const msg = encodeURIComponent(`Hi! I'm interested in ${sku}.`); window.open(`https://wa.me/${cfg.contact.whatsapp_number}?text=${msg}`, '_blank'); }
async function render(){ const list = await fetchProducts(); const el = document.getElementById('products'); el.innerHTML = list.filter(p=>p.active).map(productCard).join(''); const dd = document.getElementById('product'); if(dd){ dd.innerHTML = list.map(p=>`<option value='${p.sku}'>${p.sku} — ${p.name}</option>`).join(''); } }
render();

// Contact form
async function submitContact(evt){ evt.preventDefault(); const name=document.getElementById('name').value.trim(); const email=document.getElementById('email').value.trim(); const phone=document.getElementById('phone').value.trim(); const product=document.getElementById('product').value; const message=document.getElementById('message').value.trim(); const copyMe=document.getElementById('copyMe').checked; const waOpt=document.getElementById('waOpt').checked; const cfg=await loadConfig(); try{ const r=await fetch(cfg.appsScriptUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'contact',name,email,phone,product,message,copyMe,waOpt})}); if(r.ok){ alert('Message sent. We will reply soon.'); } else { alert('Could not send message.'); } }catch(e){ alert('Network error.'); } }
const cf=document.getElementById('contactForm'); if(cf){ cf.addEventListener('submit', submitContact); }

document.getElementById('whatsappBtn')?.addEventListener('click', ()=>{ const sku=document.getElementById('product').value; openWhatsApp(sku); });

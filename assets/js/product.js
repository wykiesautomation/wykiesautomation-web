
async function loadConfig(){ const r = await fetch('config.json'); return await r.json(); }
async function getProducts(){ const r = await fetch('data/products.json'); return await r.json(); }
function q(name){ return new URLSearchParams(window.location.search).get(name); }
function formatPrice(v){return 'R' + Number(v).toLocaleString('en-ZA');}
async function render(){ const sku=q('sku'); document.getElementById('crumbSku').textContent = sku || ''; const list = await getProducts(); const p = list.find(x=>x.sku===sku) || list[0]; const html = `<img src='${p.imageUrl}' alt='${p.name}' style='width:100%;height:260px;object-fit:cover;border-radius:8px'>
<h2 style='margin-top:12px'>${p.name}</h2>
<div class='price'>${formatPrice(p.price)}</div>
<p>${p.description}</p>
<div class=btns>
<button class='btn accent' onclick="payfastCheckout('${p.sku}')">Buy via PayFast</button>
${p.trialUrl? `<a class=btn secondary href='${p.trialUrl}' target='_blank'>Trial (.exe)</a>`:''}
${p.docUrl? `<a class=btn secondary href='${p.docUrl}' target='_blank'>Documentation</a>`:''}
<button class='btn secondary' onclick="openWhatsApp('${p.sku}')">WhatsApp</button>
<button class='btn secondary' onclick="openEmail('${p.sku}')">Email</button>
</div>`; document.getElementById('productDetail').innerHTML = html; }
function openEmail(sku){ const mail='wykiesautomation@gmail.com'; const subject=encodeURIComponent('Product enquiry: '+sku); const body=encodeURIComponent('Hi Wykies Automation,

I would like to know more about '+sku+'.

Regards'); window.location.href = `mailto:${mail}?subject=${subject}&body=${body}`; }
async function openWhatsApp(sku){ const cfg = await loadConfig(); const msg = encodeURIComponent(`Hi! I'm interested in ${sku}.`); window.open(`https://wa.me/${cfg.contact.whatsapp_number}?text=${msg}`, '_blank'); }
render();

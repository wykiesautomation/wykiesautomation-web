const API = {
  products: '/cms/products',
  priceLog: '/cms/priceLog'
};
const CONTACT = { email: 'wykiesautomation@gmail.com', wa: '27716816131' };

// Nav
const pages = document.querySelectorAll('.page');
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const id=a.dataset.page;document.querySelectorAll('.nav a').forEach(n=>n.classList.remove('active'));a.classList.add('active');pages.forEach(p=>p.classList.add('hidden'));document.getElementById(id).classList.remove('hidden');document.querySelector('.hero').style.display=(id==='home')?'block':'none';}));

// CTAs
const waUrl = `https://wa.me/${CONTACT.wa}?text=Hi%20Wykies%20Automation%2C%20I%20have%20a%20question.`;
document.getElementById('btnWhatsApp').href = waUrl;document.getElementById('waLink').href = waUrl;
document.getElementById('btnDownload').addEventListener('click',()=>document.querySelector('.nav a[data-page="documents"]').click());
document.getElementById('btnDocs').addEventListener('click',()=>document.querySelector('.nav a[data-page="documents"]').click());

document.getElementById('contactLine').innerText = `Email: ${CONTACT.email} · WhatsApp: +27 71 681 6131`;

// Fetch helpers
async function fetchJSON(url){ const r = await fetch(url, { headers: { 'Accept':'application/json' }}); if(!r.ok) throw new Error('Fetch failed'); return await r.json(); }

// Render products
function productCard(p){return `<div class='card'><div class='product'><div class='thumb'>${p.id}</div><div style='flex:1'><h3>${p.name}</h3><div class='muted'><strong>R ${Number(p.priceVatIncl).toLocaleString()}</strong> VAT incl</div><p class='muted'>${p.description||''}</p><div class='row'><button class='btn' onclick="openProduct('${p.id}')">View</button><button class='btn' onclick="buy('${p.id}')">Buy with PayFast</button></div></div></div></div>`}

function renderProducts(list){
  const active = list.filter(p=>String(p.active).toLowerCase()==='true' || p.active===true);
  document.getElementById('products-grid').innerHTML = active.slice(0,4).map(productCard).join('');
  const q = (document.getElementById('search')?.value||'').toLowerCase();
  const filtered = active.filter(p=> (p.name||'').toLowerCase().includes(q) || (p.id||'').toLowerCase().includes(q));
  document.getElementById('products-grid-full').innerHTML = filtered.map(productCard).join('');
}

// PriceLog
function renderPriceLog(rows){
  document.getElementById('price-log').innerHTML = rows.map(r=>`<tr><td>${r.productId}</td><td>R ${r.oldPrice} → R ${r.newPrice}</td><td>${new Date(r.changedAtISO).toLocaleString()}</td><td>${r.note||''}</td></tr>`).join('');
}

// Documents (placeholder list)
function renderDocs(){
  const docs=[{title:'Plasma Cutter — User Manual (PDF)',url:'#'},{title:'Gate Opener — Datasheet (PDF)',url:'#'},{title:'3D Printer GUI — Quick Start (PDF)',url:'#'}];
  document.getElementById('docs-grid').innerHTML = docs.map(d=>`<div class='card'><h3>${d.title}</h3><button class='btn' onclick="window.open('${d.url}','_blank')">Download</button></div>`).join('');
}

// Product modal + PayFast form
function openModal(inner){document.getElementById('modalInner').innerHTML=inner;document.getElementById('modal').classList.remove('hidden');}
function closeModal(){document.getElementById('modal').classList.add('hidden');}

function openProduct(id){
  const p = window.__products.find(x=>x.id===id);
  if(!p) return;
  const html = `<h3>${p.name}</h3><p class='muted'>${p.description||''}</p><div class='row'><strong>R ${Number(p.priceVatIncl).toLocaleString()} VAT incl</strong></div>
  <h4>Checkout with PayFast</h4><p class='muted'>We validate payments server-side; no passphrase is exposed.</p>
  <form method='post' action='https://www.payfast.co.za/eng/process'>
    <input type='hidden' name='merchant_id' value='32913011'/>
    <input type='hidden' name='merchant_key' value='8wd7iwcgippud'/>
    <input type='hidden' name='return_url' value='https://wykiesautomation.co.za/pay/success'/>
    <input type='hidden' name='cancel_url' value='https://wykiesautomation.co.za/pay/cancel'/>
    <input type='hidden' name='notify_url' value='https://wykiesautomation.co.za/payfast/itn'/>
    <input type='hidden' name='m_payment_id' value='${p.id}-`+Date.now()+`'/>
    <input type='hidden' name='amount' value='${p.priceVatIncl}'/>
    <input type='hidden' name='item_name' value='${p.name}'/>
    <input type='hidden' name='item_description' value='${(p.description||'').slice(0,80)}'/>
    <div class='row'><input class='input' name='email_address' type='email' placeholder='Your email' required/></div>
    <div class='row'><button class='btn' type='submit'>Pay with PayFast</button><button class='btn' type='button' onclick='closeModal()'>Close</button></div>
  </form>`;
  openModal(html);
}
function buy(id){ openProduct(id); }

// Contact (mock)
document.getElementById('contactForm').addEventListener('submit',e=>{e.preventDefault();alert('Thanks! We'll reply shortly. (Form logs to Sheet in live backend.)');e.target.reset();});

async function boot(){
  try{
    const [prods,log] = await Promise.all([fetchJSON(API.products), fetchJSON(API.priceLog)]);
    window.__products = prods;
    renderProducts(prods);
    renderPriceLog(log);
    renderDocs();
    document.getElementById('search').addEventListener('input',()=>renderProducts(prods));
  }catch(err){ console.error(err); alert('Failed to load content.'); }
}
boot();

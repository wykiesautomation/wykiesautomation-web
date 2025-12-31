const PF_HOST='www.payfast.co.za';
const MERCHANT_ID='32913011';
const MERCHANT_KEY='8wd7iwcgippud';
const RETURN_URL='https://wykiesautomation.co.za/thank-you.html';
const CANCEL_URL='https://wykiesautomation.co.za/cancelled.html';
const NOTIFY_URL='https://script.google.com/macros/s/DEPLOYMENT_ID/exec?route=itn';

const $=s=>document.querySelector(s);const grid=$('#gridProducts');
async function loadProducts(){const r=await fetch('products.json');const items=await r.json();renderGrid(items.filter(p=>p.published));}
function renderGrid(items){grid.innerHTML='';items.forEach(p=>{const d=document.createElement('div');d.className='product';const img=(p.images&&p.images[0])?p.images[0]:'brand/logo-256w.png';
 d.innerHTML=`<img src="${img}" alt="${escapeHtml(p.name)}"/>
<div class="p-body">
<div class="row between"><h3>${escapeHtml(p.name)}</h3><span class="badge">${escapeHtml(p.id)}</span></div>
<p class="muted">${escapeHtml(p.short||'')}</p>
<div class="price">R ${Number(p.price_vat_incl).toLocaleString()}</div>
<div class="actions"><a class="btn" href="product.html?id=${encodeURIComponent(p.id)}">Details</a><button class="btn brand" data-buy="${p.id}">Buy</button></div>
</div>`;grid.appendChild(d);});
 grid.querySelectorAll('[data-buy]').forEach(b=>b.addEventListener('click',()=>startPayfast(items.find(x=>x.id===b.dataset.buy))));
 // Surprise: Theme toggle
 const t=document.createElement('button');t.className='theme-toggle';t.textContent='Toggle theme';t.onclick=()=>{const dark=getComputedStyle(document.documentElement).getPropertyValue('--bg');document.documentElement.style.setProperty('--bg',dark.trim()==='#0f1220'?'#f7f9ff':'#0f1220');document.documentElement.style.setProperty('--text',dark.trim()==='#0f1220'?'#0b2447':'#e6eaf6');};document.body.appendChild(t);
}
async function startPayfast(p){if(!p)return;const f=document.createElement('form');f.action=`https://${PF_HOST}/eng/process`;f.method='post';const data={merchant_id:MERCHANT_ID,merchant_key:MERCHANT_KEY,return_url:RETURN_URL,cancel_url:CANCEL_URL,notify_url:NOTIFY_URL,m_payment_id:p.id,amount:Number(p.price_vat_incl).toFixed(2),item_name:`${p.id} ${p.name}`,item_description:p.short||''};Object.entries(data).forEach(([k,v])=>{const i=document.createElement('input');i.type='hidden';i.name=k;i.value=String(v);f.appendChild(i);});document.body.appendChild(f);f.submit();}
function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',''':'&#39;'}[m]));}
loadProducts();

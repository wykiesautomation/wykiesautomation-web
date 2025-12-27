const state={products:[]};
const fmtZAR=n=>`R${n.toLocaleString('en-ZA',{minimumFractionDigits:2})}`;
async function loadCfg(){return fetch('config.json').then(r=>r.json())}
async function fetchProducts(cfg){
  try{const r=await fetch(cfg.appsScriptUrl+`?sheet=Products`);const j=await r.json();state.products=j.items||[]}catch(e){state.products=[{sku:'WA-01',name:'3D Printer Control V1',price:1499,summary:'Pre-order desktop GUI + ESP32 firmware',description:'',imageUrl:'assets/img/wa-placeholder.svg',docUrl:'#',trialUrl:'#',active:true}]}
}
function card(p){return `<article class="card"><img src="${p.imageUrl}" alt="${p.name}" loading="lazy"><div class="body"><div style="display:flex;justify-content:space-between;align-items:center"><strong>${p.name}</strong><span class="price">${fmtZAR(Number(p.price||0))}</span></div><p class="muted">${p.summary||''}</p><div style="display:flex;gap:8px"><a class="btn" href="product.html?sku=${encodeURIComponent(p.sku)}">View Details</a></div></div></article>`}
function render(list){const grid=document.querySelector('#products');if(!grid)return;grid.innerHTML=list.filter(p=>p.active!==false).map(card).join('')}
window.filterProducts=(q)=>{q=(q||'').toLowerCase();render(state.products.filter(p=>[p.name,p.sku,(p.summary||'')].join('
').toLowerCase().includes(q)))}
async function initProductPage(cfg){const u=new URLSearchParams(location.search);const sku=u.get('sku');if(!sku) return;const p=state.products.find(x=>x.sku===sku)||state.products[0];if(!p) return;document.getElementById('pname').textContent=p.name;document.getElementById('psummary').textContent=p.summary||'';document.getElementById('pprice').textContent=fmtZAR(Number(p.price||0));document.getElementById('pdesc').innerHTML=(p.description||'').replaceAll('
','<br>');document.getElementById('pimg').src=p.imageUrl;document.getElementById('docs').href=p.docUrl||'#';document.getElementById('trial').href=p.trialUrl||'#';document.getElementById('waBtn').href=`https://wa.me/27716816131?text=Interested%20in%20${encodeURIComponent(p.sku)}%20${encodeURIComponent(p.name)}`;
  const buy=document.getElementById('buy');buy.addEventListener('click',async(e)=>{e.preventDefault();buy.textContent='Redirecting…';try{const href=`${cfg.appsScriptUrl}?action=createCheckout&sku=${encodeURIComponent(p.sku)}&return=${encodeURIComponent(cfg.returnUrl)}&cancel=${encodeURIComponent(cfg.cancelUrl)}&notify=${encodeURIComponent(cfg.notifyUrl)}`;const r=await fetch(href);const j=await r.json();if(j && j.url){location.href=j.url}else{alert('Checkout error.');buy.textContent='Buy with PayFast'}}catch(err){alert('Checkout error');buy.textContent='Buy with PayFast'}});
}
(async()=>{const cfg=await loadCfg();await fetchProducts(cfg);render(state.products);await initProductPage(cfg);document.querySelectorAll('#year').forEach(n=>n.textContent=new Date().getFullYear())})();

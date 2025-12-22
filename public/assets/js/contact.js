
const SA_WHATSAPP = '27716816131'; // Janes' business number in E.164 without '+'

async function fetchProducts(){
  try{ const r = await fetch('/.netlify/functions/cms-read?type=products'); if(r.ok) return (await r.json()).products; }catch(e){}
  const r2 = await fetch('/data/products.json'); return await r2.json();
}

(async ()=>{
  const PRODUCTS = await fetchProducts();
  const PS = document.getElementById('productSelect');
  if (PS){ PRODUCTS.forEach(p=>{ const opt=document.createElement('option'); opt.value=p.sku; opt.textContent=`${p.sku} — ${p.name}`; PS.appendChild(opt); }); }
})();

const form = document.getElementById('contactForm');
const statusEl = document.getElementById('status');
const waLink = document.getElementById('whatsappLink');

function buildWaUrl(data){
  const msg = `Hi Wykies Automation,%0A%0AName: ${encodeURIComponent(data.name)}%0AEmail: ${encodeURIComponent(data.email)}%0APhone: ${encodeURIComponent(data.phone||'')}%0AProduct: ${encodeURIComponent(data.product||'N/A')}%0A%0A${encodeURIComponent(data.message)}`;
  return `https://wa.me/${SA_WHATSAPP}?text=${msg}`;
}

form?.addEventListener('input', ()=>{
  const data = Object.fromEntries(new FormData(form).entries());
  waLink.href = buildWaUrl(data);
});

form?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  statusEl.textContent = 'Sending...';
  try{
    const resp = await fetch('/.netlify/functions/cms-write',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ type:'contact', data })
    });
    const ok = resp.ok;
    statusEl.textContent = ok ? 'Thanks! We have emailed a confirmation.' : 'Failed to send. Please try WhatsApp as well.';
    waLink.href = buildWaUrl(data);
    if (data.whatsapp) window.open(waLink.href, '_blank');
  }catch(err){ statusEl.textContent = 'Error: '+err.message; }
});

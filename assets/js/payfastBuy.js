(function(){
  async function payfastBuy(sku, buyer={}){
    const res = await fetch('https://admin-proxy.wykiesautomation.co.za/payfast/sign', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sku, ...buyer })});
    const json = await res.json();
    if(!json.ok) throw new Error(json.error||'Signing failed');
    const { processUrl, fields } = json;
    const f = document.createElement('form'); f.method='POST'; f.action=processUrl;
    Object.entries(fields).forEach(([name,value])=>{ const i=document.createElement('input'); i.type='hidden'; i.name=name; i.value=value; f.appendChild(i); });
    document.body.appendChild(f); f.submit();
  }
  document.addEventListener('click', (e)=>{ const el=e.target.closest('[data-buy-sku]'); if(!el) return; e.preventDefault(); const sku=el.getAttribute('data-buy-sku'); payfastBuy(sku).catch(err=>{ console.error(err); alert('Could not start checkout. Please try again or contact us.'); }); });
  window.payfastBuy = payfastBuy;
})();

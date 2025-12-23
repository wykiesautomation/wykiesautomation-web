
const ProductPage = {
  async init(){
    const sku = new URL(location.href).searchParams.get('sku');
    const { items } = await API.get('products');
    const p = items.find(x=>x.sku===sku) || items[0];
    qs('#prodSku').textContent = p.sku;
    qs('#prodName').textContent = p.name;
    qs('#prodPrice').textContent = Currency.format(p.price);
    qs('#prodSummary').textContent = p.summary||'';
    qs('#prodDescription').textContent = p.description||'';
    qs('#prodImg').src = p.imageUrl || 'assets/img/placeholder.png';
    qs('#docBtn').href = p.docUrl || '#';
    qs('#trialBtn').href = p.trialUrl || '#';
    EmailForm.populateSkuList(p.sku);
    this.product = p;
  },
  openWhatsApp(){
    const p = this.product; const msg = encodeURIComponent(`Hi, I'm interested in ${p.sku} — ${p.name}.`);
    location.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;
  },
  downloadTrial(){ const p=this.product; if(p.trialUrl) window.open(p.trialUrl,'_blank'); },
  async checkout(){
    const p = this.product; const payload = await API.post('createPayment', { sku:p.sku, amount:p.price, item_name:p.name });
    if(payload && payload.redirect) { location.href = payload.redirect; }
    else if(payload && payload.form) {
      // Create and submit form to PayFast securely without exposing passphrase
      const form = document.createElement('form'); form.method='post'; form.action = payload.action;
      for(const [k,v] of Object.entries(payload.form)){
        const input = document.createElement('input'); input.type='hidden'; input.name=k; input.value=v; form.appendChild(input);
      }
      document.body.appendChild(form); form.submit();
    } else {
      alert('Payment init failed.');
    }
  }
};
window.addEventListener('DOMContentLoaded', ()=>ProductPage.init());

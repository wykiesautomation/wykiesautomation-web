(async () => {
  const url = new URL(location.href);
  const sku = url.searchParams.get('sku');
  const { api } = await window.__ensureApi();
  if(!sku){document.getElementById('product').innerHTML='<p class="error">Missing SKU.</p>';return;}
  try {
    const products = await api.get('products');
    const p = products.find(x=>String(x.sku).toUpperCase()===String(sku).toUpperCase());
    if(!p){document.getElementById('product').innerHTML='<p class="error">Product not found.</p>';return;}
    document.getElementById('product-img').src = p.image||'/assets/img/placeholder.png';
    document.getElementById('product-name').textContent = p.name;
    document.getElementById('product-sku').textContent = `SKU: ${p.sku}`;
    document.getElementById('product-price').textContent = `R${Number(p.price).toLocaleString('en-ZA')}`;
    const trial = document.getElementById('trial-link');
    trial.href = p.trial||'#';
    if(!p.trial) trial.classList.add('disabled');
    const buyBtn = document.getElementById('buy-btn');
    buyBtn.addEventListener('click', async () => {
      const buyerEmail = prompt('Enter your email for the invoice:');
      if(!buyerEmail) return;
      try{
        const payload = { sku: p.sku, buyer: { email: buyerEmail } };
        const res = await api.post('payments/create', payload);
        // res.html is an auto-submit form page
        const w = window.open('', '_self');
        w.document.write(res.html || 'Redirecting...');
        w.document.close();
      }catch(err){
        alert('Failed to initiate payment: '+err.message);
      }
    });
    document.getElementById('product-description').innerHTML = p.description || '';
  } catch (e) {
    document.getElementById('product').innerHTML = `<p class=error>Failed to load product. ${e}</p>`
  }
})();
